import type { Request, Response, NextFunction } from "express";
import { getActiveCategories } from "../services/category.service.js";
import { sendSuccess } from "../utils/apiResponse.js";

export const getCategories = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const categories = await getActiveCategories();

    sendSuccess(
      res,
      200,
      "Categories retrieved successfully",
      categories,
    );
  } catch (error) {
    next(error);
  }
};