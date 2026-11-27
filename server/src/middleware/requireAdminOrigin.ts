import type { Request, Response, NextFunction } from "express";
import { env } from "../config/env.js";
import AppError from "../utils/AppError.js";

const ADMIN_ORIGIN = new URL(env.ADMIN_URL).origin;

const requireAdminOrigin = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  const origin = req.get("origin");

  if (!origin || origin !== ADMIN_ORIGIN) {
    next(new AppError("Forbidden request origin", 403));
    return;
  }

  next();
};

export default requireAdminOrigin;
