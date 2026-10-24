import Category from "../models/Category.js";
import Product from "../models/Product.js";
import AppError from "../utils/AppError.js";
import Variant from "../models/Variant.js";
export const getActiveProducts = async (query) => {
    const { page, limit, category: categorySlug, department } = query;
    let activeCategoryIds;
    if (categorySlug) {
        const category = await Category.findOne({
            slug: categorySlug,
            isActive: true,
            ...(department ? { department } : {}),
        })
            .select("_id")
            .lean();
        if (!category) {
            throw new AppError("Category not found", 404);
        }
        activeCategoryIds = [category._id];
    }
    else {
        const activeCategories = await Category.find({
            isActive: true,
            ...(department ? { department } : {}),
        })
            .select("_id")
            .lean();
        activeCategoryIds = activeCategories.map((category) => category._id);
    }
    const pipeline = [
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
        {
            $addFields: {
                price: { $arrayElemAt: ["$variants.price", 0] },
                compareAtPrice: {
                    $arrayElemAt: ["$variants.compareAtPrice", 0],
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
                isFeatured: 1,
                featuredOrder: 1,
                highlights: 1,
                details: 1,
                seo: 1,
                status: 1,
                createdAt: 1,
            },
        },
        { $sort: { createdAt: -1, _id: 1 } },
    ];
    const skip = (page - 1) * limit;
    const [products, countResult] = await Promise.all([
        Product.aggregate([...pipeline, { $skip: skip }, { $limit: limit }]),
        Product.aggregate([...pipeline, { $count: "total" }]),
    ]);
    const total = countResult[0]?.total ?? 0;
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
                isFeatured: 1,
                featuredOrder: 1,
                highlights: 1,
                details: 1,
                seo: 1,
                createdAt: 1,
            },
        },
        {
            $sort: {
                featuredOrder: 1,
                createdAt: -1,
                _id: 1,
            },
        },
        { $limit: 8 },
    ]);
    return products;
};
export const getActiveProductBySlug = async (slug) => {
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
        variants,
    };
};
export const createProduct = async (input) => {
    const session = await Product.startSession();
    try {
        let createdProductId;
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
            const [product] = await Product.create([
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
            ], { session });
            await Variant.insertMany(input.variants.map((variant) => ({
                ...variant,
                product: product._id,
                isActive: true,
            })), { session });
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
    }
    finally {
        await session.endSession();
    }
};
export const updateProduct = async (productId, input) => {
    const updates = { ...input };
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
            throw new AppError("A product must have at least one active variant before it can be activated", 400);
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
    const product = await Product.findByIdAndUpdate(productId, { $set: updates }, {
        new: true,
        runValidators: true,
    })
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
