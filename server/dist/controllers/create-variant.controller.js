import { createVariant } from "../services/variant.service.js";
import { sendSuccess } from "../utils/apiResponse.js";
export const createVariantController = async (req, res, next) => {
    try {
        const validatedData = res.locals.validatedData;
        const variant = await createVariant(validatedData.body);
        sendSuccess(res, 201, "Variant created successfully", variant);
    }
    catch (error) {
        next(error);
    }
};
