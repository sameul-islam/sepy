import { Router } from "express";
import { getProducts } from "../controllers/product.controller.js";
import validate from "../middleware/validate.js";
import { productListQuerySchema } from "../schemas/product.schema.js";
import { getProductBySlug } from "../controllers/product-details.controller.js";
import { productSlugParamsSchema } from "../schemas/product.schema.js";
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
router.get("/", validate(listProductsSchema), getProducts);
router.get("/:slug", validate(getProductBySlugSchema), getProductBySlug);
export default router;
