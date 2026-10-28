import Category from "../models/Category.js";
const CATEGORY_ORDER = [
    "womens-tops",
    "womens-bottoms",
    "womens-hoodies",
    "womens-activewear",
    "mens-tops",
    "mens-bottoms",
    "mens-hoodies",
    "mens-activewear",
];
export const getActiveCategories = async () => {
    const categories = await Category.find({ isActive: true })
        .select("_id name slug department image")
        .lean();
    const order = new Map(CATEGORY_ORDER.map((slug, index) => [slug, index]));
    categories.sort((a, b) => (order.get(a.slug) ?? Number.MAX_SAFE_INTEGER) -
        (order.get(b.slug) ?? Number.MAX_SAFE_INTEGER));
    return categories;
};
