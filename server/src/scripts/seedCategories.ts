import mongoose from "mongoose";
import connectDatabase from "../config/database.js";
import Category from "../models/Category.js";

const categories = [
  {
    name: "Women's Tops",
    slug: "womens-tops",
    department: "women",
  },
  {
    name: "Women's Bottoms",
    slug: "womens-bottoms",
    department: "women",
  },
  {
    name: "Women's Hoodies",
    slug: "womens-hoodies",
    department: "women",
  },
  {
    name: "Women's Activewear",
    slug: "womens-activewear",
    department: "women",
  },
  {
    name: "Men's Tops",
    slug: "mens-tops",
    department: "men",
  },
  {
    name: "Men's Bottoms",
    slug: "mens-bottoms",
    department: "men",
  },
  {
    name: "Men's Hoodies",
    slug: "mens-hoodies",
    department: "men",
  },
  {
    name: "Men's Activewear",
    slug: "mens-activewear",
    department: "men",
  },
] as const;

const seedCategories = async (): Promise<void> => {
  try {
    await connectDatabase();

    const operations = categories.map((category) => ({
      updateOne: {
        filter: { slug: category.slug },
        update: {
          $set: {
            name: category.name,
            department: category.department,
          },
          $setOnInsert: {
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
    console.log(`Existing categories updated: ${result.modifiedCount}`);
  } catch (error) {
    console.error("Category seeding failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

void seedCategories();
