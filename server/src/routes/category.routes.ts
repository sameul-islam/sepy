import { Router } from "express";
import {
  createCategoryController,
  getCategories,
  getHomepageCategoriesController,
  updateCategoryImagesController,
  updateHomepageCategoriesController,
  getAdminCategoriesController,
} from "../controllers/category.controller.js";
import requireAdmin from "../middleware/requireAdmin.js";
import validate from "../middleware/validate.js";
import {
  categoryImagesUpdateSchema,
  homepageCategoriesQuerySchema,
  homepageCategoryConfigSchema,
  adminCategoryListQuerySchema,
  createCategorySchema,
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

router.get(
  "/admin",
  requireAdmin,
  validate(adminCategoryListQuerySchema),
  getAdminCategoriesController,
);

router.post(
  "/admin",
  requireAdmin,
  validate(createCategorySchema),
  createCategoryController,
);

router.get("/", getCategories);

export default router;
