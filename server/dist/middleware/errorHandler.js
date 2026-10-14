import mongoose from "mongoose";
import AppError from "../utils/AppError.js";
const errorHandler = (error, _req, res, _next) => {
    if (error instanceof AppError) {
        console.error(error);
        res.status(error.statusCode).json({
            success: false,
            message: error.message,
            ...(error.details !== undefined && {
                details: error.details,
            }),
        });
        return;
    }
    if (error instanceof mongoose.Error.ValidationError ||
        error instanceof mongoose.Error.CastError) {
        res.status(400).json({
            success: false,
            message: "Invalid data provided",
        });
        return;
    }
    if (error instanceof mongoose.mongo.MongoServerError &&
        error.code === 11000) {
        res.status(409).json({
            success: false,
            message: "A product with this slug or SKU already exists",
        });
        return;
    }
    console.error(error);
    res.status(500).json({
        success: false,
        message: "Internal server error",
    });
};
export default errorHandler;
