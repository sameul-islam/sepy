import type { Request, Response, NextFunction } from "express";
import { createProduct } from "../services/product.service.js";
import type { CreateProductInput } from "../schemas/product.schema.js";
import { sendSuccess } from "../utils/apiResponse.js";

export const createProductController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const input = res.locals.validatedData.body as CreateProductInput;

    const product = await createProduct(input);

    sendSuccess(
      res,
      201,
      "Product created successfully",
      product,
    );
  } catch (error) {
    next(error);
  }
};
