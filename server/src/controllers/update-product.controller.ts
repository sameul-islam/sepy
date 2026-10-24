
import type { Request, Response, NextFunction } from "express";
import { updateProduct } from "../services/product.service.js";
import type { UpdateProductRequestInput } from "../schemas/product.schema.js";
import { sendSuccess } from "../utils/apiResponse.js";

export const updateProductController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const validatedData = res.locals.validatedData as {
      body: UpdateProductRequestInput;
      params: { id: string };
    };

    const product = await updateProduct(
      validatedData.params.id,
      validatedData.body,
    );

    sendSuccess(res, 200, "Product updated successfully", product);
  } catch (error) {
    next(error);
  }
};
