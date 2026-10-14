import { createProduct } from "../services/product.service.js";
import { sendSuccess } from "../utils/apiResponse.js";
export const createProductController = async (req, res, next) => {
    try {
        const input = res.locals.validatedData.body;
        const product = await createProduct(input);
        sendSuccess(res, 201, "Product created successfully", product);
    }
    catch (error) {
        next(error);
    }
};
