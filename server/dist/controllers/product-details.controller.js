import { getActiveProductBySlug } from "../services/product.service.js";
import { sendSuccess } from "../utils/apiResponse.js";
export const getProductBySlug = async (req, res, next) => {
    try {
        const { slug } = res.locals.validatedData.params;
        const product = await getActiveProductBySlug(slug);
        sendSuccess(res, 200, "Product retrieved successfully", product);
    }
    catch (error) {
        next(error);
    }
};
