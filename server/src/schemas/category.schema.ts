import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[a-f\d]{24}$/i, "Category ID must be a valid MongoDB ObjectId");

export const homepageCategoryConfigSchema = z
  .object({
    body: z
      .object({
        department: z.enum(["women", "men"]),

        categoryIds: z
          .array(objectIdSchema)
          .max(4, "A maximum of four featured categories is allowed")
          .refine((ids) => new Set(ids).size === ids.length, {
            message: "Duplicate category IDs are not allowed",
          }),
      })
      .strict(),

    params: z.object({}).strict(),

    query: z.object({}).strict(),
  })
  .strict();

export type HomepageCategoryConfigInput = z.infer<
  typeof homepageCategoryConfigSchema
>["body"];

export const homepageCategoriesQuerySchema = z
  .object({
    body: z.object({}).strict().default({}),
    params: z.object({}).strict(),
    query: z
      .object({
        department: z.enum(["women", "men"]),
      })
      .strict(),
  })
  .strict();

export type HomepageCategoriesQuery = z.infer<
  typeof homepageCategoriesQuerySchema
>["query"];

export const categoryImagesUpdateSchema = z
  .object({
    body: z
      .object({
        images: z
          .object({
            women: z.string().trim().url().max(2048).nullable().optional(),
            men: z.string().trim().url().max(2048).nullable().optional(),
            default: z.string().trim().url().max(2048).nullable().optional(),
          })
          .strict()
          .refine((images) => Object.keys(images).length > 0, {
            message: "At least one image field must be provided",
          }),
      })
      .strict(),

    params: z
      .object({
        id: objectIdSchema,
      })
      .strict(),

    query: z.object({}).strict(),
  })
  .strict();

export type CategoryImagesUpdateInput = z.infer<
  typeof categoryImagesUpdateSchema
>["body"];

export const adminCategoryListQuerySchema = z
  .object({
    body: z.object({}).strict().default({}),

    params: z.object({}).strict(),

    query: z
      .object({
        search: z.string().trim().min(1).max(80).optional(),

        page: z.coerce
          .number()
          .int()
          .min(1)
          .max(Math.floor(Number.MAX_SAFE_INTEGER / 100))
          .default(1),

        limit: z.coerce.number().int().min(1).max(100).default(12),

        isActive: z
          .enum(["true", "false"])
          .transform((value) => value === "true")
          .optional(),

        sort: z
          .enum([
            "newest",
            "oldest",
            "name-asc",
            "name-desc",
            "recently-updated",
          ])
          .default("newest"),
      })
      .strict(),
  })
  .strict();

export type AdminCategoryListQuery = z.infer<
  typeof adminCategoryListQuerySchema
>["query"];
