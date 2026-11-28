import Category from "../models/Category.js";
import HomepageCategoryConfig from "../models/HomepageCategoryConfig.js";
import type {
  CategoryImagesUpdateInput,
  HomepageCategoriesQuery,
  HomepageCategoryConfigInput,
  AdminCategoryListQuery,
} from "../schemas/category.schema.js";
import AppError from "../utils/AppError.js";

const CATEGORY_ORDER = [
  "tops",
  "bottoms",
  "hoodies",
  "outerwear",
  "accessories",
] as const;

const HOMEPAGE_CONFIG_ID = "homepage-category-config";

export const getActiveCategories = async () => {
  const categories = await Category.find({ isActive: true })
    .select("_id name slug images")
    .lean();

  const order = new Map<string, number>(
    CATEGORY_ORDER.map((slug, index) => [slug, index]),
  );

  categories.sort(
    (a, b) =>
      (order.get(a.slug) ?? Number.MAX_SAFE_INTEGER) -
      (order.get(b.slug) ?? Number.MAX_SAFE_INTEGER),
  );

  return categories;
};

export const getHomepageCategories = async (query: HomepageCategoriesQuery) => {
  const { department } = query;

  const config = await HomepageCategoryConfig.findById(HOMEPAGE_CONFIG_ID)
    .select(department)
    .lean();

  const categoryIds = config?.[department] ?? [];

  if (categoryIds.length === 0) {
    return [];
  }

  const categories = await Category.find({
    _id: { $in: categoryIds },
    isActive: true,
  })
    .select("_id name slug images")
    .lean();

  const categoryMap = new Map(
    categories.map((category) => [String(category._id), category]),
  );

  return categoryIds.flatMap((id) => {
    const category = categoryMap.get(String(id));

    if (!category) {
      return [];
    }

    const image = category.images?.[department] ?? category.images?.default;

    if (!image) {
      return [];
    }

    return [
      {
        _id: category._id,
        name: category.name,
        slug: category.slug,
        image,
      },
    ];
  });
};

export const updateHomepageCategories = async (
  input: HomepageCategoryConfigInput,
) => {
  const { department, categoryIds } = input;

  if (categoryIds.length > 0) {
    const categories = await Category.find({
      _id: { $in: categoryIds },
      isActive: true,
    })
      .select("_id images")
      .lean();

    if (categories.length !== categoryIds.length) {
      throw new AppError("One or more categories are missing or inactive", 400);
    }

    const categoryMap = new Map(
      categories.map((category) => [String(category._id), category]),
    );

    const categoriesWithoutImages = categoryIds.filter((id) => {
      const category = categoryMap.get(id);

      return !(category?.images?.[department] ?? category?.images?.default);
    });

    if (categoriesWithoutImages.length > 0) {
      throw new AppError(
        "Every featured category must have a department or default image",
        400,
        { categoryIds: categoriesWithoutImages },
      );
    }
  }

  const config = await HomepageCategoryConfig.findOneAndUpdate(
    { _id: HOMEPAGE_CONFIG_ID },
    {
      $set: {
        [department]: categoryIds,
      },
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    },
  ).lean();

  if (!config) {
    throw new AppError("Homepage category configuration failed", 500);
  }

  return {
    department,
    categoryIds: config[department].map(String),
  };
};

export const updateCategoryImages = async (
  categoryId: string,
  input: CategoryImagesUpdateInput,
) => {
  const updates: Record<string, string> = {};
  const removals: Record<string, ""> = {};

  for (const [key, value] of Object.entries(input.images)) {
    const path = `images.${key}`;

    if (value === null) {
      removals[path] = "";
    } else if (value !== undefined) {
      updates[path] = value;
    }
  }

  const update: Record<string, unknown> = {};

  if (Object.keys(updates).length > 0) {
    update.$set = updates;
  }

  if (Object.keys(removals).length > 0) {
    update.$unset = removals;
  }

  const category = await Category.findByIdAndUpdate(categoryId, update, {
    new: true,
    runValidators: true,
  })
    .select("_id name slug images isActive")
    .lean();

  if (!category) {
    throw new AppError("Category not found", 404);
  }

  return category;
};

export const getAdminCategories = async (query: AdminCategoryListQuery) => {
  const { search, page, limit, isActive, sort } = query;

  const skip = (page - 1) * limit;

  // Escape special regex characters in user input.
  const searchRegex = search
    ? new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i")
    : undefined;

  const sortOptions: Record<
    AdminCategoryListQuery["sort"],
    Record<string, 1 | -1>
  > = {
    newest: {
      createdAt: -1,
      _id: -1,
    },

    oldest: {
      createdAt: 1,
      _id: 1,
    },

    "name-asc": {
      name: 1,
      _id: 1,
    },

    "name-desc": {
      name: -1,
      _id: -1,
    },

    "recently-updated": {
      updatedAt: -1,
      _id: -1,
    },
  };

  const filter: Record<string, unknown> = {};

  if (isActive !== undefined) {
    filter.isActive = isActive;
  }

  if (searchRegex) {
    filter.name = searchRegex;
  }

  const [categories, total] = await Promise.all([
    Category.find(filter)
      .select("_id name slug images isActive createdAt updatedAt")
      .sort(sortOptions[sort])
      .skip(skip)
      .limit(limit)
      .lean(),

    Category.countDocuments(filter),
  ]);

  return {
    categories,

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
