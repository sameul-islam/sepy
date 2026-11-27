import type { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import AdminSession from "../models/AdminSession.js";
import { env } from "../config/env.js";
import type { AdminLoginInput } from "../schemas/auth.schema.js";
import AppError from "../utils/AppError.js";
import { sendSuccess } from "../utils/apiResponse.js";
import {
  ADMIN_SESSION_DURATION_MS,
  createRefreshToken,
  hashRefreshToken,
  setRefreshCookie,
} from "../utils/adminSession.js";

export const adminLogin = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { email, password } = res.locals.validatedData
      .body as AdminLoginInput;

    const user = await User.findOne({
      email,
      role: "admin",
      isActive: true,
    }).select("+passwordHash");

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new AppError("Invalid email or password", 401);
    }

    const accessToken = jwt.sign({ role: "admin" }, env.JWT_ACCESS_SECRET, {
      subject: user._id.toString(),
      expiresIn: "15m",
      issuer: "sepy-api",
      audience: "sepy-admin",
    });

    const refreshToken = createRefreshToken();
    const refreshTokenHash = hashRefreshToken(refreshToken);

    const now = new Date();
    const expiresAt = new Date(now.getTime() + ADMIN_SESSION_DURATION_MS);

    await AdminSession.create({
      adminId: user._id,
      refreshTokenHash,
      expiresAt,
      lastUsedAt: now,
    });

    setRefreshCookie(res, refreshToken);

    sendSuccess(res, 200, "Admin login successful", {
      accessToken,
      tokenType: "Bearer",
      expiresIn: 900,
      admin: {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};
