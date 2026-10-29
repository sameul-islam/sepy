import type { NextFunction, Request, Response } from "express";
import {
  getActiveLooks,
  getActiveLookBySlug,
  createLook,
  updateLook,
  getFeaturedLooks,
  getAllLooksForAdmin,
} from "../services/look.service.js";
import { sendSuccess } from "../utils/apiResponse.js";
import type {
  createLookSchema,
  updateLookSchema,
} from "../schemas/look.schema.js";
import type { z } from "zod";

export const listLooks = async (_req: Request, res: Response) => {
  const looks = await getActiveLooks();

  return sendSuccess(res, 200, "Looks retrieved successfully", looks);
};

export const listFeaturedLooks = async (_req: Request, res: Response) => {
  const looks = await getFeaturedLooks();

  return sendSuccess(res, 200, "Featured Looks retrieved successfully", looks);
};

export const listAllLooksForAdmin = async (_req: Request, res: Response) => {
  const looks = await getAllLooksForAdmin();

  return sendSuccess(res, 200, "All Looks retrieved successfully", looks);
};

export const getLookBySlug = async (req: Request, res: Response) => {
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

export const createLookController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const input = res.locals.validatedData.body as z.infer<
      typeof createLookSchema
    >;

    const look = await createLook(input);

    sendSuccess(res, 201, "Look created successfully", look);
  } catch (error) {
    next(error);
  }
};

export const updateLookController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const validatedData = res.locals.validatedData as {
      body: z.infer<typeof updateLookSchema>;
      params: { id: string };
    };

    const look = await updateLook(validatedData.params.id, validatedData.body);

    sendSuccess(res, 200, "Look updated successfully", look);
  } catch (error) {
    next(error);
  }
};
