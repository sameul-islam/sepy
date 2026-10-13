import { getActiveProducts } from "../services/product.service.js";
import { sendSuccess } from "../utils/apiResponse.js";
export const getProducts = async (req, res, next) => {
    try {
        const query = res.locals.validatedData
            .query;
        const result = await getActiveProducts(query);
        sendSuccess(res, 200, "Products retrieved successfully", result);
    }
    catch (error) {
        next(error);
    }
};
