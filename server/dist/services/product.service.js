import Category from "../models/Category.js";
import Product from "../models/Product.js";
import AppError from "../utils/AppError.js";
export const getActiveProducts = async (query) => {
    const { page, limit, category: categorySlug } = query;
    let categoryId;
    if (categorySlug) {
        const category = await Category.findOne({
            slug: categorySlug,
            isActive: true,
        })
            .select("_id")
            .lean();
        if (!category) {
            throw new AppError("Category not found", 404);
        }
        categoryId = category._id;
    }
    const filter = {
        status: "active",
        ...(categoryId ? { category: categoryId } : {}),
    };
    const skip = (page - 1) * limit;
    const [products, total] = await Promise.all([
        Product.find(filter)
            .select("name slug description price compareAtPrice sku category images status createdAt")
            .populate({
            path: "category",
            select: "name slug department",
            match: { isActive: true },
        })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        Product.countDocuments(filter),
    ]);
    const activeCategoryProducts = products.filter((product) => product.category !== null);
    return {
        products: activeCategoryProducts,
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
export const getActiveProductBySlug = async (slug) => {
    const product = await Product.findOne({
        slug,
        status: "active",
    })
        .select("name slug description price compareAtPrice sku category images status createdAt")
        .populate({
        path: "category",
        select: "name slug department",
        match: { isActive: true },
    })
        .lean();
    if (!product || !product.category) {
        throw new AppError("Product not found", 404);
    }
    return product;
};
