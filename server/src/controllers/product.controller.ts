import type { Request, Response, NextFunction } from "express";
import {
  getActiveProducts,
  getFeaturedProducts,
  getAdminProducts,
} from "../services/product.service.js";
import { getProductSearchSuggestions } from "../services/product-search.service.js";
import type {
  ProductListQuery,
  ProductSearchSuggestionsQuery,
  AdminProductListQuery,
} from "../schemas/product.schema.js";
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

export const getProductSearchSuggestionsController = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const query = res.locals.validatedData
      .query as ProductSearchSuggestionsQuery;

    const result = await getProductSearchSuggestions(query.q);

    sendSuccess(
      res,
      200,
      "Product search suggestions retrieved successfully",
      result,
    );
  } catch (error) {
    next(error);
  }
};

export const getAdminProductsController = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const query = res.locals.validatedData.query as AdminProductListQuery;

    const result = await getAdminProducts(query);

    res.status(200).json({
      success: true,
      message: "Admin products retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
