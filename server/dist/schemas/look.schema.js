import { z } from "zod";
const lookProductSchema = z.object({
    product: z.string().min(1, "Product is required"),
    color: z.string().trim().toLowerCase().max(60).optional(),
    sortOrder: z.number().int().min(0),
});
const lookImageSchema = z.object({
    url: z.string().trim().min(1).max(2048),
    alt: z.string().trim().min(1).max(200),
});
export const createLookSchema = z.object({
    title: z.string().trim().min(1).max(160),
    slug: z
        .string()
        .trim()
        .toLowerCase()
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    eyebrow: z.string().trim().max(80).optional(),
    image: lookImageSchema,
    products: z.array(lookProductSchema).min(1).max(8),
    isActive: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
    sortOrder: z.number().int().min(0).optional(),
});
export const updateLookSchema = createLookSchema
    .partial()
    .refine((data) => Object.keys(data).length > 0, "At least one field is required");
export const lookIdParamsSchema = z
    .object({
    params: z.object({
        id: z.string().regex(/^[a-f\d]{24}$/i, "Invalid Look ID"),
    }),
    body: z.object({}).strict().default({}),
    query: z.object({}).strict(),
})
    .strict();
export const createLookRequestSchema = z
    .object({
    body: createLookSchema,
    params: z.object({}).strict(),
    query: z.object({}).strict(),
})
    .strict();
export const updateLookRequestSchema = z
    .object({
    body: updateLookSchema,
    params: z.object({
        id: z.string().regex(/^[a-f\d]{24}$/i, "Invalid Look ID"),
    }),
    query: z.object({}).strict(),
})
    .strict();
