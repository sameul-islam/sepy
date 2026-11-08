import "dotenv/config";
import mongoose from "mongoose";
import connectDatabase from "../config/database.js";
import Category from "../models/Category.js";
import Product from "../models/Product.js";
const ACCESSORIES_CATEGORY_SLUG = "accessories";
const LEGACY_UNISEX_CATEGORY_SLUG = "unisex-activewear";
const ACCESSORIES_PRODUCT_NAME = "SEPY Essential Performance Cap";
const buildMigrationPlan = async (session) => {
    let categoryQuery = Category.find({})
        .select("_id slug department isActive")
        .lean();
    let productQuery = Product.find({})
        .select("_id name category audience")
        .lean();
    if (session) {
        categoryQuery = categoryQuery.session(session);
        productQuery = productQuery.session(session);
    }
    const [categories, products] = await Promise.all([
        categoryQuery,
        productQuery,
    ]);
    const categoryMap = new Map(categories.map((category) => [
        category._id.toString(),
        {
            slug: category.slug,
            department: String(category.department ?? ""),
        },
    ]));
    const categoryBySlug = new Map(categories.map((category) => [category.slug, category]));
    const accessoriesCategory = categoryBySlug.get(ACCESSORIES_CATEGORY_SLUG);
    const legacyUnisexCategory = categoryBySlug.get(LEGACY_UNISEX_CATEGORY_SLUG);
    if (!accessoriesCategory || !accessoriesCategory.isActive) {
        throw new Error("Active Accessories category was not found. Migration aborted.");
    }
    if (!legacyUnisexCategory) {
        throw new Error("Legacy Unisex Activewear category was not found. Migration aborted.");
    }
    const accessoriesProducts = products.filter((product) => product.name === ACCESSORIES_PRODUCT_NAME);
    if (accessoriesProducts.length !== 1) {
        throw new Error(`Expected exactly one "${ACCESSORIES_PRODUCT_NAME}", found ${accessoriesProducts.length}. Migration aborted.`);
    }
    const accessoriesProduct = accessoriesProducts[0];
    if (accessoriesProduct.audience && accessoriesProduct.audience !== "unisex") {
        throw new Error("Performance Cap has an unexpected audience. Migration aborted.");
    }
    const productUpdates = [];
    for (const product of products) {
        const existingAudience = product.audience;
        if (existingAudience &&
            !["women", "men", "unisex"].includes(existingAudience)) {
            throw new Error(`Invalid audience found for product "${product.name}". Migration aborted.`);
        }
        const category = categoryMap.get(product.category.toString());
        if (!category) {
            throw new Error(`Category missing for product "${product.name}". Migration aborted.`);
        }
        let audience;
        if (existingAudience) {
            audience = existingAudience;
        }
        else {
            if (category.department !== "women" &&
                category.department !== "men" &&
                category.department !== "unisex") {
                throw new Error(`Cannot determine audience for "${product.name}" from category "${category.slug}". Migration aborted.`);
            }
            audience = category.department;
        }
        // Performance Cap is explicitly Unisex.
        if (product._id.equals(accessoriesProduct._id)) {
            audience = "unisex";
        }
        if (!existingAudience || existingAudience !== audience) {
            productUpdates.push({
                id: product._id,
                name: product.name,
                audience,
            });
        }
    }
    return {
        productUpdates,
        accessoriesProductId: accessoriesProduct._id,
        accessoriesCategoryId: accessoriesCategory._id,
        categoryUpdates: [ACCESSORIES_CATEGORY_SLUG, LEGACY_UNISEX_CATEGORY_SLUG],
    };
};
const applyMigration = async (session, plan) => {
    for (const product of plan.productUpdates) {
        const result = await Product.updateOne({ _id: product.id }, { $set: { audience: product.audience } }, { session });
        if (result.matchedCount !== 1) {
            throw new Error(`Failed to update product "${product.name}". Transaction aborted.`);
        }
    }
    // Move the Performance Cap into Accessories.
    const capResult = await Product.updateOne({ _id: plan.accessoriesProductId }, {
        $set: {
            category: plan.accessoriesCategoryId,
            audience: "unisex",
        },
    }, { session });
    if (capResult.matchedCount !== 1) {
        throw new Error("Failed to move Performance Cap into Accessories.");
    }
    // Remove the legacy Unisex department designation.
    await Category.updateMany({ slug: { $in: plan.categoryUpdates } }, { $set: { department: null } }, { session });
};
const migrateProductAudience = async () => {
    const shouldApply = process.argv.includes("--apply");
    let session;
    try {
        await connectDatabase();
        if (!shouldApply) {
            console.log("\n=== PRODUCT AUDIENCE MIGRATION: DRY RUN ===\n");
            const plan = await buildMigrationPlan();
            console.log(`Products requiring audience updates: ${plan.productUpdates.length}`);
            for (const product of plan.productUpdates) {
                console.log(`- ${product.name} => ${product.audience}`);
            }
            console.log("\nPerformance Cap will move into Accessories.");
            console.log(`Categories to update: ${plan.categoryUpdates.join(", ")}`);
            console.log("\nDry run completed. No database changes were made.");
            console.log("Run with --apply to execute the migration.");
            return;
        }
        const activeSession = await mongoose.startSession();
        session = activeSession;
        let migrationPlan;
        await activeSession.withTransaction(async () => {
            migrationPlan = await buildMigrationPlan(activeSession);
            await applyMigration(activeSession, migrationPlan);
        });
        if (!migrationPlan) {
            throw new Error("Migration did not produce a valid plan.");
        }
        console.log("\n=== MIGRATION COMPLETED SUCCESSFULLY ===");
        console.log(`Products updated: ${migrationPlan.productUpdates.length}`);
        console.log("Performance Cap moved into Accessories.");
        console.log("Both category department values set to null.");
        console.log("Transaction committed successfully.");
    }
    catch (error) {
        console.error("\nProduct audience migration failed:", error);
        process.exitCode = 1;
    }
    finally {
        if (session) {
            await session.endSession();
        }
        await mongoose.disconnect();
    }
};
void migrateProductAudience();
