import { Request, Response } from "express";
import { sendSuccess } from "../utils/apiResponse.js";
import { getHealthStatus } from "../services/health.service.js";

export const getHealth = (_req: Request, res: Response): void => {
  const health = getHealthStatus();

  sendSuccess(res, 200, "SEPY API is running", health);
};