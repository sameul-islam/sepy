import type { Request, Response, NextFunction } from "express";
import { getActiveProductBySlug } from "../services/product.service.js";
import { sendSuccess } from "../utils/apiResponse.js";

export const getProductBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { slug } = res.locals.validatedData.params as {
      slug: string;
    };

    const product = await getActiveProductBySlug(slug);

    sendSuccess(res, 200, "Product retrieved successfully", product);
  } catch (error) {
    next(error);
  }
};
