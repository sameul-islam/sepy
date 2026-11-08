import Category from "../models/Category.js";

const CATEGORY_ORDER = [
  "tops",
  "bottoms",
  "hoodies",
  "outerwear",
  "accessories",
] as const;

export const getActiveCategories = async () => {
  const categories = await Category.find({ isActive: true })
    .select("_id name slug image")
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