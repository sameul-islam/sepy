import { getActiveProducts, getFeaturedProducts } from "../services/product.service.js";
import { sendSuccess } from "../utils/apiResponse.js";
export const getProducts = async (req, res, next) => {
    try {
        const query = res.locals.validatedData.query;
        const result = await getActiveProducts(query);
        sendSuccess(res, 200, "Products retrieved successfully", result);
    }
    catch (error) {
        next(error);
    }
};
export const getFeaturedProductsController = async (_req, res, next) => {
    try {
        const products = await getFeaturedProducts();
        sendSuccess(res, 200, "Featured products retrieved successfully", {
            products,
        });
    }
    catch (error) {
        next(error);
    }
};
