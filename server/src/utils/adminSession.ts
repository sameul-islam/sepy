import { createHash, randomBytes } from "node:crypto";
import type { CookieOptions, Response } from "express";
import { env } from "../config/env.js";

export const ADMIN_REFRESH_COOKIE = "sepy_admin_refresh";

export const ADMIN_SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

const getRefreshCookieOptions = (): CookieOptions => ({
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/api/v1/auth",
});

export const createRefreshToken = (): string =>
  randomBytes(64).toString("base64url");

export const hashRefreshToken = (token: string): string =>
  createHash("sha256").update(token).digest("hex");

export const setRefreshCookie = (res: Response, token: string): void => {
  res.cookie(ADMIN_REFRESH_COOKIE, token, {
    ...getRefreshCookieOptions(),
    maxAge: ADMIN_SESSION_DURATION_MS,
  });
};

export const clearRefreshCookie = (res: Response): void => {
  res.clearCookie(ADMIN_REFRESH_COOKIE, getRefreshCookieOptions());
};
