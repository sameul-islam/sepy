import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import AdminSession from "../models/AdminSession.js";
import { env } from "../config/env.js";
import AppError from "../utils/AppError.js";
import { sendSuccess } from "../utils/apiResponse.js";
import {
  ADMIN_REFRESH_COOKIE,
  ADMIN_SESSION_DURATION_MS,
  createRefreshToken,
  hashRefreshToken,
  setRefreshCookie,
  clearRefreshCookie,
} from "../utils/adminSession.js";

export const refreshAdminSession = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const currentRefreshToken = req.cookies?.[ADMIN_REFRESH_COOKIE] as
      | string
      | undefined;

    if (!currentRefreshToken) {
      throw new AppError("Refresh token is required", 401);
    }

    const currentTokenHash = hashRefreshToken(currentRefreshToken);

    const now = new Date();

    const session = await AdminSession.findOne({
      refreshTokenHash: currentTokenHash,
      revokedAt: null,
      expiresAt: { $gt: now },
    });

    if (!session) {
      throw new AppError("Invalid or expired session", 401);
    }

    const admin = await User.findOne({
      _id: session.adminId,
      role: "admin",
      isActive: true,
    });

    if (!admin) {
      throw new AppError("Admin account is inactive", 401);
    }

    const nextRefreshToken = createRefreshToken();
    const nextRefreshTokenHash = hashRefreshToken(nextRefreshToken);

    const nextExpiresAt = new Date(now.getTime() + ADMIN_SESSION_DURATION_MS);

    // Atomically rotate the refresh token.
    // Only one request using the current token can succeed.
    const updatedSession = await AdminSession.findOneAndUpdate(
      {
        _id: session._id,
        refreshTokenHash: currentTokenHash,
        revokedAt: null,
        expiresAt: { $gt: now },
      },
      {
        $set: {
          refreshTokenHash: nextRefreshTokenHash,
          lastUsedAt: now,
          expiresAt: nextExpiresAt,
        },
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!updatedSession) {
      throw new AppError("Session has already been used or expired", 401);
    }

    const accessToken = jwt.sign({ role: "admin" }, env.JWT_ACCESS_SECRET, {
      subject: admin._id.toString(),
      expiresIn: "15m",
      issuer: "sepy-api",
      audience: "sepy-admin",
    });

    setRefreshCookie(res, nextRefreshToken);

    sendSuccess(res, 200, "Admin session refreshed successfully", {
      accessToken,
      tokenType: "Bearer",
      expiresIn: 900,
      admin: {
        id: admin._id.toString(),
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const logoutAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const refreshToken = req.cookies?.[ADMIN_REFRESH_COOKIE] as
      | string
      | undefined;

    if (refreshToken) {
      const refreshTokenHash = hashRefreshToken(refreshToken);

      await AdminSession.updateOne(
        {
          refreshTokenHash,
          revokedAt: null,
        },
        {
          $set: {
            revokedAt: new Date(),
          },
        },
      );
    }

    clearRefreshCookie(res);

    sendSuccess(res, 200, "Admin logged out successfully", null);
  } catch (error) {
    next(error);
  }
};
