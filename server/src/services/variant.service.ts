import mongoose from "mongoose";
import AppError from "../utils/AppError.js";
import Variant from "../models/Variant.js";
import Product from "../models/Product.js";
import type {
  UpdateVariantRequestInput,
  CreateVariantRequestInput,
} from "../schemas/variant.schema.js";

export const updateVariant = async (
  variantId: string,
  input: UpdateVariantRequestInput,
) => {
  if (!mongoose.isValidObjectId(variantId)) {
    throw new AppError("Invalid variant ID", 400);
  }

  const existingVariant = await Variant.findById(variantId).lean();

  if (!existingVariant) {
    throw new AppError("Variant not found", 404);
  }

  if (input.isActive === false && existingVariant.isActive) {
    const product = await Product.findById(existingVariant.product)
      .select("status")
      .lean();

    if (product?.status === "active") {
      const anotherActiveVariant = await Variant.exists({
        product: existingVariant.product,
        isActive: true,
        _id: { $ne: existingVariant._id },
      });

      if (!anotherActiveVariant) {
        throw new AppError(
          "An active product must have at least one active variant",
          400,
        );
      }
    }
  }

  const updates: Record<string, unknown> = { ...input };

  const nextPrice =
    input.price !== undefined ? input.price : existingVariant.price;

  const nextCompareAtPrice =
    input.compareAtPrice !== undefined
      ? input.compareAtPrice
      : existingVariant.compareAtPrice;

  if (nextCompareAtPrice != null && nextCompareAtPrice <= nextPrice) {
    throw new AppError(
      "Compare-at price must be greater than the selling price",
      400,
    );
  }

  const updatedVariant = await Variant.findByIdAndUpdate(
    variantId,
    { $set: updates },
    {
      new: true,
      runValidators: true,
    },
  ).lean();

  if (!updatedVariant) {
    throw new AppError("Variant not found", 404);
  }

  return updatedVariant;
};

export const createVariant = async (input: CreateVariantRequestInput) => {
  const product = await Product.findById(input.product).select("_id").lean();

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  const variant = await Variant.create({
    product: product._id,
    sku: input.sku,
    size: input.size,
    color: input.color,
    price: input.price,
    compareAtPrice: input.compareAtPrice,
    stock: input.stock,
    isActive: true,
  });

  return variant.toObject();
};
