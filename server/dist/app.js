import express from "express";
import cors from "cors";
import errorHandler from "./middleware/errorHandler.js";
import AppError from "./utils/AppError.js";
const app = express();
app.use(cors());
app.use(express.json());
app.get("/api/v1/health", (_req, res) => {
    res.status(200).json({
        success: true,
        message: "SEPY API is running",
    });
});
app.get("/api/v1/test-error", (_req, _res) => {
    throw new AppError("This is a test error", 400);
});
app.use(errorHandler);
export default app;
