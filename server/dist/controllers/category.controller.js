import { getActiveCategories, getHomepageCategories, updateCategoryImages, updateHomepageCategories, } from "../services/category.service.js";
import { sendSuccess } from "../utils/apiResponse.js";
export const getCategories = async (_req, res, next) => {
    try {
        const categories = await getActiveCategories();
        sendSuccess(res, 200, "Categories retrieved successfully", categories);
    }
    catch (error) {
        next(error);
    }
};
export const getHomepageCategoriesController = async (req, res, next) => {
    try {
        const validatedData = res.locals.validatedData;
        const categories = await getHomepageCategories(validatedData.query);
        sendSuccess(res, 200, "Homepage categories retrieved successfully", categories);
    }
    catch (error) {
        next(error);
    }
};
export const updateHomepageCategoriesController = async (req, res, next) => {
    try {
        const validatedData = res.locals.validatedData;
        const config = await updateHomepageCategories(validatedData.body);
        sendSuccess(res, 200, "Homepage categories updated successfully", config);
    }
    catch (error) {
        next(error);
    }
};
export const updateCategoryImagesController = async (req, res, next) => {
    try {
        const validatedData = res.locals.validatedData;
        const category = await updateCategoryImages(validatedData.params.id, validatedData.body);
        sendSuccess(res, 200, "Category images updated successfully", category);
    }
    catch (error) {
        next(error);
    }
};
