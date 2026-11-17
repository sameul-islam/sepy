
import { Router } from "express";
import {
  getCategories,
  getHomepageCategoriesController,
  updateCategoryImagesController,
  updateHomepageCategoriesController,
} from "../controllers/category.controller.js";
import requireAdmin from "../middleware/requireAdmin.js";
import validate from "../middleware/validate.js";
import {
  categoryImagesUpdateSchema,
  homepageCategoriesQuerySchema,
  homepageCategoryConfigSchema,
} from "../schemas/category.schema.js";

const router = Router();

router.get(
  "/homepage",
  validate(homepageCategoriesQuerySchema),
  getHomepageCategoriesController,
);

router.put(
  "/homepage",
  requireAdmin,
  validate(homepageCategoryConfigSchema),
  updateHomepageCategoriesController,
);

router.patch(
  "/:id/images",
  requireAdmin,
  validate(categoryImagesUpdateSchema),
  updateCategoryImagesController,
);

router.get("/", getCategories);

export default router;
