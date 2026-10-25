import { z } from "zod";

export const variantIdParamsSchema = z
  .object({
    id: z
      .string()
      .regex(/^[a-f\d]{24}$/i, "Variant ID must be a valid MongoDB ObjectId"),
  })
  .strict();

export const updateVariantSchema = z
  .object({
    body: z
      .object({
        sku: z
          .string()
          .trim()
          .min(1)
          .max(64)
          .transform((value) => value.toUpperCase())
          .optional(),

        size: z
          .string()
          .trim()
          .min(1)
          .max(40)
          .transform((value) => value.toUpperCase())
          .optional(),

        color: z
          .string()
          .trim()
          .min(1)
          .max(60)
          .transform((value) => value.toLowerCase())
          .optional(),

        price: z.number().finite().positive().optional(),

        compareAtPrice: z.number().finite().positive().nullable().optional(),

        stock: z.number().int().min(0).max(Number.MAX_SAFE_INTEGER).optional(),

        isActive: z.boolean().optional(),
      })
      .strict()
      .refine((data) => Object.keys(data).length > 0, {
        message: "At least one field must be provided for update",
      }),

    params: variantIdParamsSchema,

    query: z.object({}).strict(),
  })
  .strict()
  .superRefine((request, ctx) => {
    const { price, compareAtPrice } = request.body;

    if (
      compareAtPrice !== undefined &&
      compareAtPrice !== null &&
      price !== undefined &&
      compareAtPrice <= price
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["body", "compareAtPrice"],
        message: "Compare-at price must be greater than the selling price",
      });
    }
  });

export const createVariantSchema = z
  .object({
    body: z
      .object({
        product: z
          .string()
          .regex(
            /^[a-f\d]{24}$/i,
            "Product ID must be a valid MongoDB ObjectId",
          ),

        sku: z
          .string()
          .trim()
          .min(1)
          .max(64)
          .transform((value) => value.toUpperCase()),

        size: z
          .string()
          .trim()
          .min(1)
          .max(40)
          .transform((value) => value.toUpperCase())
          .optional(),

        color: z
          .string()
          .trim()
          .min(1)
          .max(60)
          .transform((value) => value.toLowerCase())
          .optional(),

        price: z.number().finite().positive(),

        compareAtPrice: z.number().finite().positive().optional(),

        stock: z.number().int().min(0).max(Number.MAX_SAFE_INTEGER).default(0),
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

export type CreateVariantRequestInput = z.infer<
  typeof createVariantSchema
>["body"];

export type UpdateVariantRequestInput = z.infer<
  typeof updateVariantSchema
>["body"];
