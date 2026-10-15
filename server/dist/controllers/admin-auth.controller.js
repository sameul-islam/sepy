import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { env } from "../config/env.js";
import AppError from "../utils/AppError.js";
import { sendSuccess } from "../utils/apiResponse.js";
export const adminLogin = async (_req, res, next) => {
    try {
        const { email, password } = res.locals.validatedData
            .body;
        const user = await User.findOne({
            email,
            role: "admin",
            isActive: true,
        }).select("+passwordHash");
        if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
            throw new AppError("Invalid email or password", 401);
        }
        const accessToken = jwt.sign({ role: "admin" }, env.JWT_ACCESS_SECRET, {
            subject: user._id.toString(),
            expiresIn: "15m",
            issuer: "sepy-api",
            audience: "sepy-admin",
        });
        sendSuccess(res, 200, "Admin login successful", {
            accessToken,
            tokenType: "Bearer",
            expiresIn: 900,
            admin: {
                id: user._id.toString(),
                email: user.email,
                role: user.role,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
