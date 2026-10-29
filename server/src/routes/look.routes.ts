import { Router } from "express";
import {
  listLooks,
  getLookBySlug,
  createLookController,
  updateLookController,
  listFeaturedLooks,
  listAllLooksForAdmin,
} from "../controllers/look.controller.js";
import validate from "../middleware/validate.js";
import requireAdmin from "../middleware/requireAdmin.js";
import {
  createLookRequestSchema,
  updateLookRequestSchema,
} from "../schemas/look.schema.js";

const router = Router();

router.get("/", listLooks);

router.get("/featured", listFeaturedLooks);

router.get("/admin", requireAdmin, listAllLooksForAdmin);

router.get("/:slug", getLookBySlug);

router.post(
  "/",
  requireAdmin,
  validate(createLookRequestSchema),
  createLookController,
);

router.patch(
  "/:id",
  requireAdmin,
  validate(updateLookRequestSchema),
  updateLookController,
);

export default router;
