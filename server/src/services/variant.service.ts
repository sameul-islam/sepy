
import mongoose from "mongoose";

import AppError from "../utils/AppError.js";
import Variant from "../models/Variant.js";
import Product from "../models/Product.js";
import {
  UpdateVariantRequestInput,
  CreateVariantRequestInput,
} from "../schemas/variant.schema.js";
import { syncProductSearchData } from "./product-search-sync.service.js";

export const updateVariant = async (
  variantId: string,
  input: UpdateVariantRequestInput,
) => {
  if (!mongoose.isValidObjectId(variantId)) {
    throw new AppError("Invalid variant ID", 400);
  }

  const session = await Product.startSession();

  try {
    const result = await session.withTransaction(async () => {
      const existingVariant = await Variant.findById(variantId)
        .session(session)
        .lean();

      if (!existingVariant) {
        throw new AppError("Variant not found", 404);
      }

      const product = await Product.findById(existingVariant.product)
        .select("status")
        .session(session)
        .lean();

      if (!product) {
        throw new AppError("Product not found", 404);
      }

      if (input.isActive === false && existingVariant.isActive) {
        if (product.status === "active") {
          const anotherActiveVariant = await Variant.exists({
            product: existingVariant.product,
            isActive: true,
            _id: { $ne: existingVariant._id },
          }).session(session);

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
          session,
        },
      ).lean();

      if (!updatedVariant) {
        throw new AppError("Variant not found", 404);
      }

      await syncProductSearchData(existingVariant.product, { session });

      return updatedVariant;
    });

    if (!result) {
      throw new AppError("Unable to update variant", 500);
    }

    return result;
  } finally {
    await session.endSession();
  }
};

export const createVariant = async (input: CreateVariantRequestInput) => {
  const session = await Product.startSession();

  try {
    const result = await session.withTransaction(async () => {
      const product = await Product.findById(input.product)
        .select("_id")
        .session(session)
        .lean();

      if (!product) {
        throw new AppError("Product not found", 404);
      }

      const [variant] = await Variant.create(
        [
          {
            product: product._id,
            sku: input.sku,
            size: input.size,
            color: input.color,
            price: input.price,
            compareAtPrice: input.compareAtPrice,
            stock: input.stock,
            isActive: true,
          },
        ],
        { session },
      );

      await syncProductSearchData(product._id, { session });

      return variant.toObject();
    });

    if (!result) {
      throw new AppError("Unable to create variant", 500);
    }

    return result;
  } finally {
    await session.endSession();
  }
};
