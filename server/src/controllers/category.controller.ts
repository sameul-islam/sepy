
import type { Request, Response, NextFunction } from "express";
import {
  getActiveCategories,
  getHomepageCategories,
  updateCategoryImages,
  updateHomepageCategories,
} from "../services/category.service.js";
import type {
  CategoryImagesUpdateInput,
  HomepageCategoriesQuery,
  HomepageCategoryConfigInput,
} from "../schemas/category.schema.js";
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

export const getHomepageCategoriesController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const validatedData = res.locals.validatedData as {
      query: HomepageCategoriesQuery;
    };

    const categories = await getHomepageCategories(validatedData.query);

    sendSuccess(
      res,
      200,
      "Homepage categories retrieved successfully",
      categories,
    );
  } catch (error) {
    next(error);
  }
};

export const updateHomepageCategoriesController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const validatedData = res.locals.validatedData as {
      body: HomepageCategoryConfigInput;
    };

    const config = await updateHomepageCategories(validatedData.body);

    sendSuccess(
      res,
      200,
      "Homepage categories updated successfully",
      config,
    );
  } catch (error) {
    next(error);
  }
};

export const updateCategoryImagesController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const validatedData = res.locals.validatedData as {
      body: CategoryImagesUpdateInput;
      params: { id: string };
    };

    const category = await updateCategoryImages(
      validatedData.params.id,
      validatedData.body,
    );

    sendSuccess(
      res,
      200,
      "Category images updated successfully",
      category,
    );
  } catch (error) {
    next(error);
  }
};
