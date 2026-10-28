import { getActiveLooks, getActiveLookBySlug, createLook, updateLook, } from "../services/look.service.js";
import { sendSuccess } from "../utils/apiResponse.js";
export const listLooks = async (_req, res) => {
    const looks = await getActiveLooks();
    return sendSuccess(res, 200, "Looks retrieved successfully", looks);
};
export const getLookBySlug = async (req, res) => {
    const slug = req.params.slug;
    if (typeof slug !== "string") {
        return res.status(400).json({
            success: false,
            message: "Invalid Look slug",
        });
    }
    const look = await getActiveLookBySlug(slug);
    return sendSuccess(res, 200, "Look retrieved successfully", look);
};
export const createLookController = async (req, res, next) => {
    try {
        const input = res.locals.validatedData.body;
        const look = await createLook(input);
        sendSuccess(res, 201, "Look created successfully", look);
    }
    catch (error) {
        next(error);
    }
};
export const updateLookController = async (req, res, next) => {
    try {
        const validatedData = res.locals.validatedData;
        const look = await updateLook(validatedData.params.id, validatedData.body);
        sendSuccess(res, 200, "Look updated successfully", look);
    }
    catch (error) {
        next(error);
    }
};
