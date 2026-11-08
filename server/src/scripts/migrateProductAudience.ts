import mongoose from "mongoose";

import connectDatabase from "../config/database.js";
import Product from "../models/Product.js";

const migrateProductAudience = async (): Promise<void> => {
  const shouldApply = process.argv.includes("--apply");

  try {
    await connectDatabase();

    if (!shouldApply) {
      const products = await Product.find({})
        .select("_id name audience")
        .lean();

      const missingAudience = products.filter(
        (product) =>
          !["women", "men", "unisex"].includes(
            String(product.audience ?? ""),
          ),
      );

      console.log("\n=== PRODUCT AUDIENCE MIGRATION STATUS ===\n");
      console.log(`Total products: ${products.length}`);
      console.log(`Products with missing/invalid audience: ${missingAudience.length}`);

      if (missingAudience.length > 0) {
        for (const product of missingAudience) {
          console.log(`- ${product.name}: ${product.audience ?? "missing"}`);
        }
      }

      console.log("\nThis migration has already been applied.");
      console.log("No database changes were made.");
      return;
    }

    throw new Error(
      "This one-time migration has already been completed. Re-running it is not allowed.",
    );
  } catch (error) {
    console.error("\nProduct audience migration failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

void migrateProductAudience();