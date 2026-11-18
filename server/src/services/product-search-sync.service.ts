import mongoose, { type ClientSession } from "mongoose";

import Category from "../models/Category.js";
import Product from "../models/Product.js";
import Variant from "../models/Variant.js";

type ProductSearchSyncOptions = {
  session?: ClientSession;
};

/**
 * Synchronizes denormalized search metadata for a product.
 *
 * Search metadata contains:
 * - Category name
 * - Unique colors from active variants
 *
 * This data is derived from the database and is never accepted
 * directly from client input.
 */
export async function syncProductSearchData(
  productId: mongoose.Types.ObjectId | string,
  options: ProductSearchSyncOptions = {},
): Promise<void> {
  const { session } = options;

  // 1. Retrieve the product's category reference.
  const productQuery = Product.findById(productId).select("category");

  if (session) {
    productQuery.session(session);
  }

  const product = await productQuery.lean();

  if (!product) {
    throw new Error(
      `Cannot synchronize search data: product "${productId}" was not found.`,
    );
  }

  // 2. Retrieve the category name.
  const categoryQuery = Category.findById(product.category).select("name");

  if (session) {
    categoryQuery.session(session);
  }

  const category = await categoryQuery.lean();

  if (!category) {
    throw new Error(
      `Cannot synchronize search data: category for product "${productId}" was not found.`,
    );
  }

  // 3. Retrieve colors from all active variants.
  const variantsQuery = Variant.find({
    product: productId,
    isActive: true,
  }).select("color");

  if (session) {
    variantsQuery.session(session);
  }

  const variants = await variantsQuery.lean();

  // 4. Normalize and remove duplicate colors.
  const colors = [
    ...new Set(
      variants
        .map((variant) => variant.color?.trim().toLowerCase())
        .filter((color): color is string => Boolean(color)),
    ),
  ].sort();

  // 5. Update the product's search metadata.
  await Product.updateOne(
    { _id: productId },
    {
      $set: {
        "search.categoryName": category.name.trim().toLowerCase(),
        "search.colors": colors,
      },
    },
    {
      runValidators: true,
      ...(session ? { session } : {}),
    },
  );
}
