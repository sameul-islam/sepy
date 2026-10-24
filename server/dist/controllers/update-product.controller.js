import { updateProduct } from "../services/product.service.js";
import { sendSuccess } from "../utils/apiResponse.js";
export const updateProductController = async (req, res, next) => {
    try {
        const validatedData = res.locals.validatedData;
        const product = await updateProduct(validatedData.params.id, validatedData.body);
        sendSuccess(res, 200, "Product updated successfully", product);
    }
    catch (error) {
        next(error);
    }
};
