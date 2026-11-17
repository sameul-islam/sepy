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
