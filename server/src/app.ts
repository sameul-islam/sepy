import express from "express";
import cors from "cors";
import errorHandler from "./middleware/errorHandler.js";
import notFound from "./middleware/notFound.js";
import healthRoutes from "./routes/health.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import productRoutes from "./routes/product.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/v1/health", healthRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/products", productRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;