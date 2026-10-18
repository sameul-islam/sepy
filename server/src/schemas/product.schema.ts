import { z } from "zod";

export const createProductSchema = z
  .object({
    body: z
      .object({
        name: z.string().trim().min(1).max(160),

        slug: z
          .string()
          .trim()
          .min(1)
          .max(180)
          .regex(
            /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
            "Slug must contain lowercase letters, numbers, and single hyphens",
          ),

        description: z.string().trim().min(1).max(10000),

        price: z.number().finite().positive(),

        compareAtPrice: z.number().finite().positive().optional(),

        sku: z
          .string()
          .trim()
          .min(1)
          .max(64)
          .transform((value) => value.toUpperCase()),

        category: z
          .string()
          .regex(/^[a-f\d]{24}$/i, "Category must be a valid MongoDB ObjectId"),

        images: z
          .array(
            z
              .object({
                url: z.string().trim().url(),
                alt: z.string().trim().min(1).max(200),
              })
              .strict(),
          )
          .min(1)
          .max(12),

        status: z.enum(["draft", "active", "archived"]).default("draft"),
      })
      .strict()
      .refine(
        (data) =>
          data.compareAtPrice === undefined || data.compareAtPrice > data.price,
        {
          message: "Compare-at price must be greater than the selling price",
          path: ["compareAtPrice"],
        },
      ),

    params: z.object({}).strict(),
    query: z.object({}).strict(),
  })
  .strict();

export type CreateProductInput = z.infer<typeof createProductSchema>["body"];

export const productListQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),

    limit: z.coerce.number().int().min(1).max(100).default(12),

    category: z
      .string()
      .trim()
      .min(1)
      .max(120)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Category must be a valid slug")
      .optional(),

      department: z.enum(["women", "men", "unisex"]).optional(),
  })
  .strict();

export type ProductListQuery = z.infer<typeof productListQuerySchema>;

export const productSlugParamsSchema = z
  .object({
    slug: z
      .string()
      .trim()
      .min(1)
      .max(180)
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Slug must contain lowercase letters, numbers, and single hyphens",
      ),
  })
  .strict();