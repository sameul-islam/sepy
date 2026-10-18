import Category from "../models/Category.js";
import Product from "../models/Product.js";
import AppError from "../utils/AppError.js";
export const getActiveProducts = async (query) => {
    const { page, limit, category: categorySlug, department, } = query;
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
    const filter = {
        status: "active",
        category: { $in: activeCategoryIds },
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
export const createProduct = async (input) => {
    const category = await Category.findOne({
        _id: input.category,
        isActive: true,
    })
        .select("_id")
        .lean();
    if (!category) {
        throw new AppError("Active category not found", 404);
    }
    const product = await Product.create({
        ...input,
        category: category._id,
    });
    return Product.findById(product._id)
        .select("name slug description price compareAtPrice sku category images status createdAt")
        .populate({
        path: "category",
        select: "name slug department",
    })
        .lean();
};
