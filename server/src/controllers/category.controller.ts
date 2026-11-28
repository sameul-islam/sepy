import type { Request, Response, NextFunction } from "express";
import {
  createCategory,
  getActiveCategories,
  getHomepageCategories,
  updateCategoryImages,
  updateHomepageCategories,
  getAdminCategories,
} from "../services/category.service.js";
import type {
  CategoryImagesUpdateInput,
  HomepageCategoriesQuery,
  HomepageCategoryConfigInput,
  AdminCategoryListQuery,
  CreateCategoryInput,
} from "../schemas/category.schema.js";
import { sendSuccess } from "../utils/apiResponse.js";

export const getCategories = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const categories = await getActiveCategories();

    sendSuccess(res, 200, "Categories retrieved successfully", categories);
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

    sendSuccess(res, 200, "Homepage categories updated successfully", config);
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

    sendSuccess(res, 200, "Category images updated successfully", category);
  } catch (error) {
    next(error);
  }
};

export const getAdminCategoriesController = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { query } = res.locals.validatedData as {
      query: AdminCategoryListQuery;
    };

    const result = await getAdminCategories(query);

    sendSuccess(res, 200, "Admin categories retrieved successfully", result);
  } catch (error) {
    next(error);
  }
};

export const createCategoryController = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { body } = res.locals.validatedData as {
      body: CreateCategoryInput;
    };

    const category = await createCategory(body);

    sendSuccess(res, 201, "Category created successfully", category);
  } catch (error) {
    next(error);
  }
};
