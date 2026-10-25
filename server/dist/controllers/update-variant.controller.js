import { updateVariant } from "../services/variant.service.js";
import { sendSuccess } from "../utils/apiResponse.js";
export const updateVariantController = async (req, res, next) => {
    try {
        const validatedData = res.locals.validatedData;
        const variant = await updateVariant(validatedData.params.id, validatedData.body);
        sendSuccess(res, 200, "Variant updated successfully", variant);
    }
    catch (error) {
        next(error);
    }
};
