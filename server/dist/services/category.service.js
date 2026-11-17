// import Category from "../models/Category.js";
// const CATEGORY_ORDER = [
//   "tops",
//   "bottoms",
//   "hoodies",
//   "outerwear",
//   "accessories",
// ] as const;
// export const getActiveCategories = async () => {
//   const categories = await Category.find({ isActive: true })
//     .select("_id name slug image")
//     .lean();
//   const order = new Map<string, number>(
//     CATEGORY_ORDER.map((slug, index) => [slug, index]),
//   );
//   categories.sort(
//     (a, b) =>
//       (order.get(a.slug) ?? Number.MAX_SAFE_INTEGER) -
//       (order.get(b.slug) ?? Number.MAX_SAFE_INTEGER),
//   );
//   return categories;
// };
import Category from "../models/Category.js";
import HomepageCategoryConfig from "../models/HomepageCategoryConfig.js";
import AppError from "../utils/AppError.js";
const CATEGORY_ORDER = [
    "tops",
    "bottoms",
    "hoodies",
    "outerwear",
    "accessories",
];
const HOMEPAGE_CONFIG_ID = "homepage-category-config";
export const getActiveCategories = async () => {
    const categories = await Category.find({ isActive: true })
        .select("_id name slug images")
        .lean();
    const order = new Map(CATEGORY_ORDER.map((slug, index) => [slug, index]));
    categories.sort((a, b) => (order.get(a.slug) ?? Number.MAX_SAFE_INTEGER) -
        (order.get(b.slug) ?? Number.MAX_SAFE_INTEGER));
    return categories;
};
export const getHomepageCategories = async (query) => {
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
    const categoryMap = new Map(categories.map((category) => [String(category._id), category]));
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
export const updateHomepageCategories = async (input) => {
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
        const categoryMap = new Map(categories.map((category) => [String(category._id), category]));
        const categoriesWithoutImages = categoryIds.filter((id) => {
            const category = categoryMap.get(id);
            return !(category?.images?.[department] ?? category?.images?.default);
        });
        if (categoriesWithoutImages.length > 0) {
            throw new AppError("Every featured category must have a department or default image", 400, { categoryIds: categoriesWithoutImages });
        }
    }
    const config = await HomepageCategoryConfig.findOneAndUpdate({ _id: HOMEPAGE_CONFIG_ID }, {
        $set: {
            [department]: categoryIds,
        },
    }, {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
    }).lean();
    if (!config) {
        throw new AppError("Homepage category configuration failed", 500);
    }
    return {
        department,
        categoryIds: config[department].map(String),
    };
};
export const updateCategoryImages = async (categoryId, input) => {
    const updates = {};
    const removals = {};
    for (const [key, value] of Object.entries(input.images)) {
        const path = `images.${key}`;
        if (value === null) {
            removals[path] = "";
        }
        else if (value !== undefined) {
            updates[path] = value;
        }
    }
    const update = {};
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
