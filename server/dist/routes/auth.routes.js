import { Router } from "express";
import { adminLogin } from "../controllers/admin-auth.controller.js";
import validate from "../middleware/validate.js";
import { adminLoginSchema } from "../schemas/auth.schema.js";
import authRateLimiter from "../middleware/authRateLimiter.js";
const router = Router();
router.post("/admin/login", authRateLimiter, validate(adminLoginSchema), adminLogin);
export default router;
