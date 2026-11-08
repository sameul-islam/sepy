import mongoose from "mongoose";

import connectDatabase from "../config/database.js";
import Category from "../models/Category.js";

const categories = [
  { name: "Tops", slug: "tops" },
  { name: "Bottoms", slug: "bottoms" },
  { name: "Hoodies", slug: "hoodies" },
  { name: "Outerwear", slug: "outerwear" },
  { name: "Accessories", slug: "accessories" },
] as const;

const seedCategories = async (): Promise<void> => {
  try {
    await connectDatabase();

    const operations = categories.map((category) => ({
      updateOne: {
        filter: { slug: category.slug },
        update: {
          $setOnInsert: {
            name: category.name,
            slug: category.slug,
            isActive: true,
          },
        },
        upsert: true,
      },
    }));

    const result = await Category.bulkWrite(operations);

    console.log("Category seeding completed successfully.");
    console.log(`Categories in seed list: ${categories.length}`);
    console.log(`New categories created: ${result.upsertedCount}`);
    console.log("Existing categories were preserved.");
  } catch (error) {
    console.error("Category seeding failed:", error);
    process.exitCode = 1;
  } finally {
    try {
      await mongoose.disconnect();
    } catch (error) {
      console.error("MongoDB disconnection failed:", error);
      process.exitCode = 1;
    }
  }
};

void seedCategories();