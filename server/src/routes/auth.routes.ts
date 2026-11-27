import { Router } from "express";
import { adminLogin } from "../controllers/admin-auth.controller.js";
import {
  refreshAdminSession,
  logoutAdmin,
} from "../controllers/admin-session.controller.js";
import validate from "../middleware/validate.js";
import { adminLoginSchema } from "../schemas/auth.schema.js";
import authRateLimiter from "../middleware/authRateLimiter.js";
import requireAdminOrigin from "../middleware/requireAdminOrigin.js";

const router = Router();

router.post(
  "/admin/login",
  requireAdminOrigin,
  authRateLimiter,
  validate(adminLoginSchema),
  adminLogin,
);

router.post("/admin/refresh", requireAdminOrigin, refreshAdminSession);

router.post("/admin/logout", requireAdminOrigin, logoutAdmin);

export default router;
