import "dotenv/config";
import { z } from "zod";

const envSchema = z
  .object({
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),

    PORT: z.coerce.number().int().min(1).max(65535).default(5000),

    MONGODB_URI: z
      .string()
      .trim()
      .min(1, "MONGODB_URI is required")
      .refine(
        (value) =>
          value.startsWith("mongodb://") || value.startsWith("mongodb+srv://"),
        "MONGODB_URI must be a valid MongoDB connection URI",
      ),

    JWT_ACCESS_SECRET: z
      .string()
      .min(32, "JWT_ACCESS_SECRET must be at least 32 characters"),

    ADMIN_EMAIL: z
      .string()
      .trim()
      .email("ADMIN_EMAIL must be a valid email")
      .transform((value) => value.toLowerCase()),

    ADMIN_PASSWORD: z
      .string()
      .min(12, "ADMIN_PASSWORD must be at least 12 characters"),

    CLIENT_URL: z.string().url("CLIENT_URL must be a valid URL"),
  })
  .superRefine((data, ctx) => {
    if (data.NODE_ENV !== "production") {
      return;
    }

    const placeholderSecrets = [
      "your-secret",
      "change-me",
      "secret",
      "your-secret-at-least-32-characters-long",
    ];

    if (
      placeholderSecrets.includes(data.JWT_ACCESS_SECRET.trim().toLowerCase())
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["JWT_ACCESS_SECRET"],
        message:
          "JWT_ACCESS_SECRET must not use a placeholder secret in production",
      });
    }

    const clientUrl = new URL(data.CLIENT_URL);

    if (clientUrl.protocol !== "https:") {
      ctx.addIssue({
        code: "custom",
        path: ["CLIENT_URL"],
        message: "CLIENT_URL must use HTTPS in production",
      });
    }

    if (["localhost", "127.0.0.1", "::1"].includes(clientUrl.hostname)) {
      ctx.addIssue({
        code: "custom",
        path: ["CLIENT_URL"],
        message: "CLIENT_URL must not use localhost in production",
      });
    }
  });

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("Invalid environment configuration:");
  console.error(parsedEnv.error.flatten().fieldErrors);

  process.exit(1);
}

export const env = parsedEnv.data;


