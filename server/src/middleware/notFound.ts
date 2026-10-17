import { NextFunction, Request, Response } from "express";
import AppError from "../utils/AppError.js";

const notFound = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  next(new AppError("Route not found", 404));
};

export default notFound;