import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import User from "../models/User.js";
import AppError from "../utils/AppError.js";
const requireAdmin = async (req, _res, next) => {
    try {
        const authorization = req.headers.authorization;
        const [scheme, token, ...extra] = authorization?.split(" ") ?? [];
        if (scheme?.toLowerCase() !== "bearer" || !token || extra.length > 0) {
            throw new AppError("Authentication required", 401);
        }
        const payload = jwt.verify(token, env.JWT_ACCESS_SECRET, {
            issuer: "sepy-api",
            audience: "sepy-admin",
            algorithms: ["HS256"],
        });
        if (payload.role !== "admin" || typeof payload.sub !== "string") {
            throw new AppError("Access denied", 403);
        }
        const admin = await User.findOne({
            _id: payload.sub,
            role: "admin",
            isActive: true,
        }).select("_id");
        if (!admin) {
            throw new AppError("Access denied", 403);
        }
        next();
    }
    catch (error) {
        if (error instanceof AppError) {
            next(error);
            return;
        }
        if (error instanceof jwt.JsonWebTokenError) {
            next(new AppError("Invalid or expired access token", 401));
            return;
        }
        next(error);
    }
};
export default requireAdmin;
