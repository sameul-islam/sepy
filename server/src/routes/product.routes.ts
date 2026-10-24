import { Router } from "express";
import {
  getProducts,
  getFeaturedProductsController,
} from "../controllers/product.controller.js";
import validate from "../middleware/validate.js";
import { getProductBySlug } from "../controllers/product-details.controller.js";
import { createProductController } from "../controllers/create-product.controller.js";
import { updateProductController } from "../controllers/update-product.controller.js";
import {
  productSlugParamsSchema,
  productIdParamsSchema,
  createProductSchema,
  updateProductSchema,
  productListQuerySchema,
} from "../schemas/product.schema.js";
import requireAdmin from "../middleware/requireAdmin.js";

import { z } from "zod";

const router = Router();

const listProductsSchema = z
  .object({
    body: z.object({}).strict().default({}),
    params: z.object({}).strict(),
    query: productListQuerySchema,
  })
  .strict();

const getProductBySlugSchema = z
  .object({
    body: z.object({}).strict().default({}),
    params: productSlugParamsSchema,
    query: z.object({}).strict(),
  })
  .strict();

const updateProductRequestSchema = z
  .object({
    body: updateProductSchema.shape.body,
    params: productIdParamsSchema,
    query: z.object({}).strict(),
  })
  .strict();

router.get("/", validate(listProductsSchema), getProducts);
router.get("/featured", getFeaturedProductsController);
router.get("/:slug", validate(getProductBySlugSchema), getProductBySlug);
router.patch(
  "/:id",
  requireAdmin,
  validate(updateProductRequestSchema),
  updateProductController,
);
router.post(
  "/",
  requireAdmin,
  validate(createProductSchema),
  createProductController,
);

export default router;
