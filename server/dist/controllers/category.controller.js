import { getActiveCategories } from "../services/category.service.js";
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
