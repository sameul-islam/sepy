import type { Request, Response, NextFunction } from "express";
import { getAdminProductById } from "../services/product.service.js";
import { sendSuccess } from "../utils/apiResponse.js";

export const getAdminProductByIdController = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = res.locals.validatedData.params as {
      id: string;
    };

    const product = await getAdminProductById(id);

    sendSuccess(res, 200, "Admin product retrieved successfully", product);
  } catch (error) {
    next(error);
  }
};
