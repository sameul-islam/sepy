import { z } from "zod";

export const adminLoginSchema = z
  .object({
    body: z
      .object({
        email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
        password: z.string().min(1).max(128),
      })
      .strict(),
    params: z.object({}).strict(),
    query: z.object({}).strict(),
  })
  .strict();

export type AdminLoginInput = z.infer<
  typeof adminLoginSchema
>["body"];