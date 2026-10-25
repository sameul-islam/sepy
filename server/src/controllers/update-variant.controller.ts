import type { Request, Response, NextFunction } from "express";
import { updateVariant } from "../services/variant.service.js";
import type { UpdateVariantRequestInput } from "../schemas/variant.schema.js";
import { sendSuccess } from "../utils/apiResponse.js";

export const updateVariantController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const validatedData = res.locals.validatedData as {
      body: UpdateVariantRequestInput;
      params: { id: string };
    };

    const variant = await updateVariant(
      validatedData.params.id,
      validatedData.body,
    );

    sendSuccess(res, 200, "Variant updated successfully", variant);
  } catch (error) {
    next(error);
  }
};
