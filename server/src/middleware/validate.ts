import { NextFunction, Request, Response } from "express";
import { ZodType } from "zod";
import AppError from "../utils/AppError.js";

const validate = (schema: ZodType) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      }));

      next(new AppError("Validation failed", 400, details));
      return;
    }

    res.locals.validatedData = result.data as {
      body: unknown;
      params: unknown;
      query: unknown;
    };

    next();
  };
};

export default validate;
