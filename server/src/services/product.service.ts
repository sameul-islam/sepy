import mongoose from "mongoose";
import type { PipelineStage } from "mongoose";
import Category from "../models/Category.js";
import Product from "../models/Product.js";
import type {
  ProductListQuery,
  CreateProductInput,
} from "../schemas/product.schema.js";
import AppError from "../utils/AppError.js";
import Variant from "../models/Variant.js";

export const getActiveProducts = async (query: ProductListQuery) => {
  const {
    page,
    limit,
    category: categorySlugs,
    department,
    size,
    color,
    minPrice,
    maxPrice,
    inStock,
    sort = "newest",
  } = query;

  let activeCategoryIds;

  if (categorySlugs?.length) {
    const activeCategories = await Category.find({
      slug: { $in: categorySlugs },
      isActive: true,
      ...(department ? { department } : {}),
    })
      .select("_id")
      .lean();

    if (activeCategories.length === 0) {
      throw new AppError("Category not found", 404);
    }

    activeCategoryIds = activeCategories.map((category) => category._id);
  } else {
    const activeCategories = await Category.find({
      isActive: true,
      ...(department ? { department } : {}),
    })
      .select("_id")
      .lean();

    activeCategoryIds = activeCategories.map((category) => category._id);
  }

  // Build conditions for the SAME variant document.
  const variantConditions: Record<string, unknown>[] = [];

  if (size?.length) {
    variantConditions.push({
      $in: ["$$variant.size", size],
    });
  }

  if (color?.length) {
    variantConditions.push({
      $in: ["$$variant.color", color],
    });
  }

  if (minPrice !== undefined) {
    variantConditions.push({
      $gte: ["$$variant.price", minPrice],
    });
  }

  if (maxPrice !== undefined) {
    variantConditions.push({
      $lte: ["$$variant.price", maxPrice],
    });
  }

  if (inStock !== undefined) {
    variantConditions.push(
      inStock
        ? {
            $gt: ["$$variant.stock", 0],
          }
        : {
            $eq: ["$$variant.stock", 0],
          },
    );
  }

  const variantCondition =
    variantConditions.length > 0 ? { $and: variantConditions } : true;

  // Base pipeline: active products with active variants and categories.
  const basePipeline: PipelineStage[] = [
    {
      $match: {
        status: "active",
        category: { $in: activeCategoryIds },
      },
    },
    {
      $lookup: {
        from: "variants",
        let: { productId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$product", "$$productId"] },
              isActive: true,
            },
          },
          { $sort: { price: 1, _id: 1 } },
        ],
        as: "variants",
      },
    },
    {
      $match: {
        "variants.0": { $exists: true },
      },
    },
    {
      $lookup: {
        from: "categories",
        localField: "category",
        foreignField: "_id",
        as: "categoryDetails",
      },
    },
    { $unwind: "$categoryDetails" },
    {
      $match: {
        "categoryDetails.isActive": true,
      },
    },
  ];

  // Apply all selected filters to one matching variant array.
  const variantFilterStages: PipelineStage[] = [
    {
      $addFields: {
        matchingVariants: {
          $filter: {
            input: "$variants",
            as: "variant",
            cond: variantCondition,
          },
        },
      },
    },
    {
      $match: {
        "matchingVariants.0": { $exists: true },
      },
    },
  ];

  // Determine product sorting.
  const sortStage: Record<string, 1 | -1> =
    sort === "price-asc"
      ? { price: 1, createdAt: -1, _id: 1 }
      : sort === "price-desc"
        ? { price: -1, createdAt: -1, _id: 1 }
        : { createdAt: -1, _id: 1 };

  const skip = (page - 1) * limit;

  // Product listing pipeline.
  const productStages: PipelineStage[] = [
    ...variantFilterStages,
    {
      $addFields: {
        price: {
          $arrayElemAt: ["$matchingVariants.price", 0],
        },

        compareAtPrice: {
          $arrayElemAt: ["$matchingVariants.compareAtPrice", 0],
        },

        inStock: {
          $gt: [
            {
              $size: {
                $filter: {
                  input: "$matchingVariants",
                  as: "variant",
                  cond: {
                    $gt: ["$$variant.stock", 0],
                  },
                },
              },
            },
            0,
          ],
        },

        availableColors: {
          $setUnion: [
            {
              $map: {
                input: {
                  $filter: {
                    input: "$matchingVariants",
                    as: "variant",
                    cond: {
                      $and: [
                        { $gt: ["$$variant.stock", 0] },
                        {
                          $eq: [{ $type: "$$variant.color" }, "string"],
                        },
                        { $ne: ["$$variant.color", ""] },
                      ],
                    },
                  },
                },
                as: "variant",
                in: "$$variant.color",
              },
            },
            [],
          ],
        },
      },
    },
    {
      $sort: sortStage,
    },
    { $skip: skip },
    { $limit: limit },
    {
      $project: {
        name: 1,
        slug: 1,
        description: 1,
        price: 1,
        compareAtPrice: 1,
        inStock: 1,

        category: {
          _id: "$categoryDetails._id",
          name: "$categoryDetails.name",
          slug: "$categoryDetails.slug",
          department: "$categoryDetails.department",
        },

        images: 1,
        availableColors: 1,
        isFeatured: 1,
        featuredOrder: 1,
        highlights: 1,
        details: 1,
        seo: 1,
        status: 1,
        createdAt: 1,
      },
    },
  ];

  // Count only products matching the selected filters.
  const countStages: PipelineStage[] = [
    ...variantFilterStages,
    {
      $count: "total",
    },
  ];

  // Generate dynamic filter options from available variants.
  const filterOptionStages: PipelineStage[] = [
    {
      $unwind: "$variants",
    },
    {
      $match: {
        "variants.stock": { $gt: 0 },
      },
    },
    {
      $group: {
        _id: null,

        sizes: {
          $addToSet: {
            $cond: [
              {
                $and: [
                  {
                    $eq: [{ $type: "$variants.size" }, "string"],
                  },
                  { $ne: ["$variants.size", ""] },
                ],
              },
              "$variants.size",
              null,
            ],
          },
        },

        colors: {
          $addToSet: {
            $cond: [
              {
                $and: [
                  {
                    $eq: [{ $type: "$variants.color" }, "string"],
                  },
                  { $ne: ["$variants.color", ""] },
                ],
              },
              "$variants.color",
              null,
            ],
          },
        },

        minPrice: {
          $min: "$variants.price",
        },

        maxPrice: {
          $max: "$variants.price",
        },
      },
    },
    {
      $project: {
        _id: 0,

        sizes: {
          $filter: {
            input: "$sizes",
            as: "value",
            cond: { $ne: ["$$value", null] },
          },
        },

        colors: {
          $filter: {
            input: "$colors",
            as: "value",
            cond: { $ne: ["$$value", null] },
          },
        },

        priceRange: {
          min: "$minPrice",
          max: "$maxPrice",
        },
      },
    },
  ];

  // Execute listing, count and filter options in one aggregation.
  const [result] = await Product.aggregate([
    ...basePipeline,
    {
      $facet: {
        products: productStages,
        count: countStages,
        filters: filterOptionStages,
      },
    } as unknown as PipelineStage,
  ]);

  const products = result?.products ?? [];
  const total = result?.count?.[0]?.total ?? 0;

  const rawFilters = result?.filters?.[0] ?? {
    sizes: [],
    colors: [],
    priceRange: {
      min: null,
      max: null,
    },
  };

  // Sort clothing sizes in a natural clothing-size order.
  const clothingSizeOrder: Record<string, number> = {
    XXXS: 0,
    XXS: 1,
    XS: 2,
    S: 3,
    M: 4,
    L: 5,
    XL: 6,
    XXL: 7,
    XXXL: 8,
    XXXXL: 9,
  };

  const sizes = [...rawFilters.sizes].sort((a: string, b: string) => {
    const aRank = clothingSizeOrder[a];
    const bRank = clothingSizeOrder[b];

    if (aRank !== undefined || bRank !== undefined) {
      return (aRank ?? 100) - (bRank ?? 100);
    }

    return a.localeCompare(b, undefined, {
      numeric: true,
      sensitivity: "base",
    });
  });

  const colors = [...rawFilters.colors].sort((a: string, b: string) =>
    a.localeCompare(b),
  );

  return {
    products,

    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPreviousPage: page > 1,
    },

    filters: {
      sizes,
      colors,
      priceRange: rawFilters.priceRange,
    },
  };
};

export const getFeaturedProducts = async () => {
  const products = await Product.aggregate([
    {
      $match: {
        status: "active",
        isFeatured: true,
      },
    },
    {
      $lookup: {
        from: "variants",
        let: { productId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$product", "$$productId"] },
              isActive: true,
            },
          },
          { $sort: { price: 1, _id: 1 } },
        ],
        as: "variants",
      },
    },
    {
      $match: {
        "variants.0": { $exists: true },
      },
    },
    {
      $lookup: {
        from: "categories",
        localField: "category",
        foreignField: "_id",
        as: "categoryDetails",
      },
    },
    { $unwind: "$categoryDetails" },
    {
      $match: {
        "categoryDetails.isActive": true,
      },
    },
    {
      $addFields: {
        price: { $arrayElemAt: ["$variants.price", 0] },
        compareAtPrice: {
          $arrayElemAt: ["$variants.compareAtPrice", 0],
        },
        availableColors: {
          $setUnion: [
            {
              $map: {
                input: {
                  $filter: {
                    input: "$variants",
                    as: "variant",
                    cond: {
                      $and: [
                        { $gt: ["$$variant.stock", 0] },
                        { $eq: [{ $type: "$$variant.color" }, "string"] },
                        { $ne: ["$$variant.color", ""] },
                      ],
                    },
                  },
                },
                as: "variant",
                in: "$$variant.color",
              },
            },
            [],
          ],
        },
      },
    },
    {
      $project: {
        name: 1,
        slug: 1,
        description: 1,
        price: 1,
        compareAtPrice: 1,
        category: {
          _id: "$categoryDetails._id",
          name: "$categoryDetails.name",
          slug: "$categoryDetails.slug",
          department: "$categoryDetails.department",
        },
        images: 1,
        availableColors: 1,
        isFeatured: 1,
        featuredOrder: 1,
        highlights: 1,
        details: 1,
        seo: 1,
        createdAt: 1,
      },
    },
    {
      $facet: {
        women: [
          { $match: { "category.department": "women" } },
          {
            $sort: {
              featuredOrder: 1,
              createdAt: -1,
              _id: 1,
            },
          },
          { $limit: 6 },
        ],
        men: [
          { $match: { "category.department": "men" } },
          {
            $sort: {
              featuredOrder: 1,
              createdAt: -1,
              _id: 1,
            },
          },
          { $limit: 6 },
        ],
      },
    },
    {
      $project: {
        products: { $concatArrays: ["$women", "$men"] },
      },
    },
    { $unwind: "$products" },
    { $replaceRoot: { newRoot: "$products" } },
    {
      $sort: {
        featuredOrder: 1,
        createdAt: -1,
        _id: 1,
      },
    },
  ]);

  return products;
};

export const getActiveProductBySlug = async (slug: string) => {
  const product = await Product.findOne({
    slug,
    status: "active",
  })
    .populate({
      path: "category",
      select: "name slug department",
      match: { isActive: true },
    })
    .lean();

  if (!product || !product.category) {
    throw new AppError("Product not found", 404);
  }

  const variants = await Variant.find({
    product: product._id,
    isActive: true,
  })
    .select("sku size color price compareAtPrice stock isActive")
    .sort({ price: 1, _id: 1 })
    .lean();

  if (variants.length === 0) {
    throw new AppError("Product not found", 404);
  }

  return {
    ...product,
    price: variants[0].price,
    ...(variants[0].compareAtPrice !== undefined
      ? { compareAtPrice: variants[0].compareAtPrice }
      : {}),
    inStock: variants.some((variant) => variant.stock > 0),
    variants,
  };
};

export const createProduct = async (input: CreateProductInput) => {
  const session = await Product.startSession();

  try {
    let createdProductId: mongoose.Types.ObjectId | undefined;

    await session.withTransaction(async () => {
      const category = await Category.findOne({
        _id: input.category,
        isActive: true,
      })
        .select("_id")
        .session(session)
        .lean();

      if (!category) {
        throw new AppError("Active category not found", 404);
      }

      const [product] = await Product.create(
        [
          {
            name: input.name,
            slug: input.slug,
            description: input.description,
            category: category._id,
            images: input.images,
            isFeatured: input.isFeatured,
            featuredOrder: input.featuredOrder,
            highlights: input.highlights,
            details: input.details,
            seo: input.seo,
            status: input.status,
          },
        ],
        { session },
      );

      await Variant.insertMany(
        input.variants.map((variant) => ({
          ...variant,
          product: product._id,
          isActive: true,
        })),
        { session },
      );

      createdProductId = product._id;
    });

    if (!createdProductId) {
      throw new AppError("Product creation failed", 500);
    }

    const product = await Product.findById(createdProductId)
      .populate({
        path: "category",
        select: "name slug department",
        match: { isActive: true },
      })
      .lean();

    if (!product || !product.category) {
      throw new AppError("Product could not be retrieved", 500);
    }

    const variants = await Variant.find({
      product: createdProductId,
      isActive: true,
    })
      .select("sku size color price compareAtPrice stock isActive createdAt")
      .sort({ createdAt: 1 })
      .lean();

    return {
      ...product,
      variants,
    };
  } finally {
    await session.endSession();
  }
};

export type UpdateProductInput = {
  name?: string;
  slug?: string;
  description?: string;
  category?: string;
  images?: {
    url: string;
    alt: string;
    publicId?: string;
    width?: number;
    height?: number;
  }[];
  isFeatured?: boolean;
  featuredOrder?: number;
  highlights?: string[];
  details?: {
    material?: string;
    fit?: string;
    careInstructions?: string[];
    activity?: string[];
  };
  seo?: {
    title?: string;
    description?: string;
  };
  status?: "draft" | "active" | "archived";
};

export const updateProduct = async (
  productId: string,
  input: UpdateProductInput,
) => {
  const updates: Record<string, unknown> = { ...input };

  const existingProduct = await Product.exists({
    _id: productId,
  });

  if (!existingProduct) {
    throw new AppError("Product not found", 404);
  }

  if (input.status === "active") {
    const activeVariant = await Variant.exists({
      product: productId,
      isActive: true,
    });

    if (!activeVariant) {
      throw new AppError(
        "A product must have at least one active variant before it can be activated",
        400,
      );
    }
  }

  if (input.details !== undefined) {
    delete updates.details;

    for (const [key, value] of Object.entries(input.details)) {
      updates[`details.${key}`] = value;
    }
  }

  if (input.seo !== undefined) {
    delete updates.seo;

    for (const [key, value] of Object.entries(input.seo)) {
      updates[`seo.${key}`] = value;
    }
  }

  if (input.category !== undefined) {
    const category = await Category.findOne({
      _id: input.category,
      isActive: true,
    })
      .select("_id")
      .lean();

    if (!category) {
      throw new AppError("Active category not found", 404);
    }

    updates.category = category._id;
  }

  const product = await Product.findByIdAndUpdate(
    productId,
    { $set: updates },
    {
      new: true,
      runValidators: true,
    },
  )
    .populate({
      path: "category",
      select: "name slug department",
      match: { isActive: true },
    })
    .lean();

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  if (!product.category) {
    throw new AppError("Active category not found", 404);
  }

  return product;
};
