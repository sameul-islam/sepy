import type { Request, Response, NextFunction } from "express";
import { createVariant } from "../services/variant.service.js";
import type { CreateVariantRequestInput } from "../schemas/variant.schema.js";
import { sendSuccess } from "../utils/apiResponse.js";

export const createVariantController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const validatedData = res.locals.validatedData as {
      body: CreateVariantRequestInput;
    };

    const variant = await createVariant(validatedData.body);

    sendSuccess(res, 201, "Variant created successfully", variant);
  } catch (error) {
    next(error);
  }
};
