import AppError from "../utils/AppError.js";
const errorHandler = (error, _req, res, _next) => {
    console.error(error);
    if (error instanceof AppError) {
        res.status(error.statusCode).json({
            success: false,
            message: error.message,
        });
        return;
    }
    res.status(500).json({
        success: false,
        message: "Internal server error",
    });
};
export default errorHandler;
