import { Response } from "express";

interface SuccessResponse<T> {
  success: true;
  message: string;
  data: T;
}

export const sendSuccess = <T>(
  res: Response,
  statusCode: number,
  message: string,
  data: T,
): void => {
  const response: SuccessResponse<T> = {
    success: true,
    message,
    data,
  };

  res.status(statusCode).json(response);
};