import express from "express";
import cors from "cors";
import errorHandler from "./middleware/errorHandler.js";
import notFound from "./middleware/notFound.js";
import healthRoutes from "./routes/health.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import productRoutes from "./routes/product.routes.js";
import variantRoutes from "./routes/variant.routes.js";
import authRoutes from "./routes/auth.routes.js";
import { env } from "./config/env.js";
const app = express();
app.use(cors({
    origin: env.CLIENT_URL,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json({ limit: "100kb" }));
app.use("/api/v1/health", healthRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/variants", variantRoutes);
app.use("/api/v1/auth", authRoutes);
app.use(notFound);
app.use(errorHandler);
export default app;
