import Look from "../models/Look.js";
import Product from "../models/Product.js";
import Variant from "../models/Variant.js";
import AppError from "../utils/AppError.js";
import mongoose from "mongoose";
import type { z } from "zod";
import { createLookSchema, updateLookSchema } from "../schemas/look.schema.js";

const getPublicLook = async (look: any) => {
  const products = [];

  for (const item of look.products) {
    const product = await Product.findOne({
      _id: item.product,
      status: "active",
    })
      .populate({
        path: "category",
        select: "name slug department",
        match: { isActive: true },
      })
      .lean();

    if (!product || !product.category) {
      continue;
    }

    let variants;

    const variantFilter = {
      product: product._id,
      isActive: true,
      ...(item.color ? { color: item.color } : {}),
    };

    variants = await Variant.find(variantFilter)
      .select("sku size color price compareAtPrice stock isActive")
      .sort({ price: 1, _id: 1 })
      .lean();

    if (variants.length === 0) {
      continue;
    }

    const images = item.color
      ? product.images.filter((image) => image.color === item.color)
      : product.images;

    if (images.length === 0) {
      continue;
    }

    products.push({
      sortOrder: item.sortOrder,
      product: {
        ...product,
        images,
        price: variants[0].price,
        ...(variants[0].compareAtPrice !== undefined
          ? { compareAtPrice: variants[0].compareAtPrice }
          : {}),
        inStock: variants.some((variant) => variant.stock > 0),
        variants,
      },
    });
  }

  return {
    ...look,
    products: products.sort((a, b) => a.sortOrder - b.sortOrder),
  };
};

export const getActiveLooks = async () => {
  const looks = await Look.find({ isActive: true })
    .sort({ sortOrder: 1, _id: 1 })
    .lean();

  const results = [];

  for (const look of looks) {
    const publicLook = await getPublicLook(look);

    if (publicLook.products.length > 0) {
      results.push(publicLook);
    }
  }

  return results;
};

export const getActiveLookBySlug = async (slug: string) => {
  const look = await Look.findOne({
    slug,
    isActive: true,
  }).lean();

  if (!look) {
    throw new AppError("Look not found", 404);
  }

  const publicLook = await getPublicLook(look);

  if (publicLook.products.length === 0) {
    throw new AppError("Look not found", 404);
  }

  return publicLook;
};

type CreateLookInput = z.infer<typeof createLookSchema>;
type UpdateLookInput = z.infer<typeof updateLookSchema>;

const validateLookProducts = async (products: CreateLookInput["products"]) => {
  for (const item of products) {
    const product = await Product.findById(item.product).select("_id").lean();

    if (!product) {
      throw new AppError("Product not found", 404);
    }

    if (item.color) {
      const variant = await Variant.findOne({
        product: product._id,
        color: item.color,
        isActive: true,
      })
        .select("_id")
        .lean();

      if (!variant) {
        throw new AppError(
          "No active variant found for the selected product color",
          400,
        );
      }
    }
  }
};

export const createLook = async (input: CreateLookInput) => {
  await validateLookProducts(input.products);

  return Look.create(input);
};

export const updateLook = async (lookId: string, input: UpdateLookInput) => {
  if (!mongoose.isValidObjectId(lookId)) {
    throw new AppError("Invalid Look ID", 400);
  }

  const existingLook = await Look.findById(lookId).lean();

  if (!existingLook) {
    throw new AppError("Look not found", 404);
  }

  if (input.products) {
    await validateLookProducts(input.products);
  }

  const updatedLook = await Look.findByIdAndUpdate(
    lookId,
    { $set: input },
    {
      new: true,
      runValidators: true,
    },
  ).lean();

  if (!updatedLook) {
    throw new AppError("Look not found", 404);
  }

  return updatedLook;
};
