import type { Request, Response, NextFunction } from "express";
import {
  getActiveProducts,
  getFeaturedProducts,
} from "../services/product.service.js";
import type { ProductListQuery } from "../schemas/product.schema.js";
import { sendSuccess } from "../utils/apiResponse.js";

export const getProducts = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const query = res.locals.validatedData.query as ProductListQuery;

    const result = await getActiveProducts(query);

    sendSuccess(res, 200, "Products retrieved successfully", result);
  } catch (error) {
    next(error);
  }
};

export const getFeaturedProductsController = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const products = await getFeaturedProducts();

    sendSuccess(res, 200, "Featured products retrieved successfully", {
      products,
    });
  } catch (error) {
    next(error);
  }
};
