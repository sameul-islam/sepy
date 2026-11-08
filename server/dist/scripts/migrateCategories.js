import "dotenv/config";
import mongoose from "mongoose";
import connectDatabase from "../config/database.js";
import Category from "../models/Category.js";
import Product from "../models/Product.js";
const CATEGORY_DEFINITIONS = [
    { name: "Tops", slug: "tops" },
    { name: "Bottoms", slug: "bottoms" },
    { name: "Hoodies", slug: "hoodies" },
    { name: "Outerwear", slug: "outerwear" },
    { name: "Accessories", slug: "accessories" },
];
const PRODUCT_CATEGORY_MAP = [
    { name: "SEPY Sculpt Performance Tank", categorySlug: "tops" },
    { name: "SEPY Mini Sculpt Sports Bra", categorySlug: "tops" },
    { name: "SEPY Flow Performance Joggers", categorySlug: "bottoms" },
    { name: "SEPY Heritage Varsity Jacket", categorySlug: "outerwear" },
    { name: "SEPY Core Knit Sweater", categorySlug: "tops" },
    { name: "SEPY Motion Training Shorts", categorySlug: "bottoms" },
    { name: "SEPY Essential Pullover Hoodie", categorySlug: "hoodies" },
    { name: "SEPY Core Performance T-Shirt", categorySlug: "tops" },
    { name: "SEPY Motion Essential Sweatpants", categorySlug: "bottoms" },
    { name: "SEPY Flex Training Shorts", categorySlug: "bottoms" },
    { name: "SEPY Heritage Rugby Polo", categorySlug: "tops" },
    { name: "SEPY Skyline Casual Shirt", categorySlug: "tops" },
    { name: "SEPY Essential Unisex T-Shirt", categorySlug: "tops" },
    { name: "SEPY Studio Essential Crewneck", categorySlug: "hoodies" },
    { name: "SEPY Essential Performance Cap", categorySlug: "accessories" },
];
const LEGACY_CATEGORY_SLUGS = [
    "womens-tops",
    "womens-bottoms",
    "womens-hoodies",
    "womens-activewear",
    "mens-tops",
    "mens-bottoms",
    "mens-hoodies",
    "mens-activewear",
    "unisex-activewear",
];
const validAudiences = new Set(["women", "men", "unisex"]);
async function buildMigrationPlan(session) {
    const productNames = PRODUCT_CATEGORY_MAP.map((item) => item.name);
    const targetSlugs = CATEGORY_DEFINITIONS.map((item) => item.slug);
    let productQuery = Product.find({
        name: { $in: productNames },
    })
        .select("_id name audience")
        .lean();
    let categoryQuery = Category.find({
        slug: { $in: [...targetSlugs, ...LEGACY_CATEGORY_SLUGS] },
    })
        .select("_id name slug isActive")
        .lean();
    if (session) {
        productQuery = productQuery.session(session);
        categoryQuery = categoryQuery.session(session);
    }
    const databaseProducts = await productQuery;
    const databaseCategories = await categoryQuery;
    if (databaseProducts.length !== PRODUCT_CATEGORY_MAP.length) {
        throw new Error(`Expected ${PRODUCT_CATEGORY_MAP.length} mapped products, but found ${databaseProducts.length}. Migration stopped.`);
    }
    const productByName = new Map(databaseProducts.map((product) => [product.name, product]));
    if (productByName.size !== PRODUCT_CATEGORY_MAP.length) {
        throw new Error("Duplicate product names were found. Migration stopped to avoid ambiguous mapping.");
    }
    const products = PRODUCT_CATEGORY_MAP.map((mapping) => {
        const product = productByName.get(mapping.name);
        if (!product) {
            throw new Error(`Product not found: ${mapping.name}`);
        }
        const audience = String(product.audience ?? "");
        if (!validAudiences.has(audience)) {
            throw new Error(`Product "${mapping.name}" has an invalid or missing audience: "${audience}".`);
        }
        return {
            _id: product._id,
            name: product.name,
            audience,
            categorySlug: mapping.categorySlug,
        };
    });
    const categoryCounts = new Map();
    for (const definition of CATEGORY_DEFINITIONS) {
        categoryCounts.set(definition.slug, 0);
    }
    for (const product of products) {
        categoryCounts.set(product.categorySlug, (categoryCounts.get(product.categorySlug) ?? 0) + 1);
    }
    const existingCategorySlugs = databaseCategories
        .filter((category) => targetSlugs.includes(category.slug))
        .map((category) => category.slug);
    const legacyCategories = databaseCategories.filter((category) => LEGACY_CATEGORY_SLUGS.includes(category.slug));
    return {
        products,
        existingCategorySlugs,
        legacyCategoryIds: legacyCategories.map((category) => category._id),
        categoryCounts,
    };
}
function printMigrationPlan(plan) {
    console.log("\n========== CATEGORY MIGRATION DRY RUN ==========\n");
    console.log("Target categories:");
    for (const category of CATEGORY_DEFINITIONS) {
        const exists = plan.existingCategorySlugs.includes(category.slug);
        console.log(`  ${exists ? "[REUSE]" : "[CREATE]"} ${category.name} (${category.slug}) — ${plan.categoryCounts.get(category.slug)} product(s)`);
    }
    console.log("\nProduct category mapping:");
    for (const product of plan.products) {
        console.log(`  ${product.name} [${product.audience}] -> ${product.categorySlug}`);
    }
    console.log("\nSummary:");
    console.log(`  Products to update: ${plan.products.length}`);
    console.log(`  Legacy categories to remove: ${plan.legacyCategoryIds.length}`);
    console.log(`  Final active categories expected: ${CATEGORY_DEFINITIONS.length}`);
    console.log("\nNo database changes have been made.");
    console.log("================================================\n");
}
async function applyMigration(session, plan) {
    const now = new Date();
    // Create the new shared categories or reuse existing matching slugs.
    for (const category of CATEGORY_DEFINITIONS) {
        await Category.collection.updateOne({ slug: category.slug }, {
            $set: {
                name: category.name,
                isActive: true,
                updatedAt: now,
            },
            $setOnInsert: {
                createdAt: now,
            },
            $unset: {
                department: "",
            },
        }, {
            upsert: true,
            session,
        });
    }
    const targetCategories = await Category.find({
        slug: { $in: CATEGORY_DEFINITIONS.map((item) => item.slug) },
    })
        .select("_id slug")
        .session(session)
        .lean();
    const categoryIdBySlug = new Map(targetCategories.map((category) => [category.slug, category._id]));
    if (categoryIdBySlug.size !== CATEGORY_DEFINITIONS.length) {
        throw new Error("Could not resolve all five target categories. Transaction will be rolled back.");
    }
    // Move every mapped product to its new shared category.
    const productOperations = plan.products.map((product) => {
        const categoryId = categoryIdBySlug.get(product.categorySlug);
        if (!categoryId) {
            throw new Error(`Target category "${product.categorySlug}" was not found.`);
        }
        return {
            updateOne: {
                filter: { _id: product._id },
                update: { $set: { category: categoryId } },
            },
        };
    });
    await Product.collection.bulkWrite(productOperations, { session });
    // Do not delete old categories if any product still references them.
    const remainingLegacyProducts = await Product.countDocuments({
        category: { $in: plan.legacyCategoryIds },
    }).session(session);
    if (remainingLegacyProducts > 0) {
        throw new Error(`${remainingLegacyProducts} product(s) still reference legacy categories. Transaction will be rolled back.`);
    }
    // Remove old gender-specific and unisex category documents.
    await Category.deleteMany({
        slug: { $in: LEGACY_CATEGORY_SLUGS },
    }, { session });
    // Remove any old department property from the five remaining categories.
    await Category.collection.updateMany({}, { $unset: { department: "" } }, { session });
    const activeCategoryCount = await Category.countDocuments({
        isActive: true,
    }).session(session);
    if (activeCategoryCount !== CATEGORY_DEFINITIONS.length) {
        throw new Error(`Expected exactly ${CATEGORY_DEFINITIONS.length} active categories after migration, but found ${activeCategoryCount}. Transaction will be rolled back.`);
    }
    const finalProductCount = await Product.countDocuments({
        _id: { $in: plan.products.map((product) => product._id) },
        category: {
            $in: targetCategories.map((category) => category._id),
        },
    }).session(session);
    if (finalProductCount !== plan.products.length) {
        throw new Error("Final product-category verification failed. Transaction will be rolled back.");
    }
}
async function removeLegacyIndex() {
    try {
        await Category.collection.dropIndex("department_1_isActive_1");
        console.log("Legacy category department index removed.");
    }
    catch (error) {
        const mongoError = error;
        if (mongoError.code === 27 ||
            mongoError.code === 26 ||
            mongoError.message?.includes("index not found")) {
            console.log("Legacy category department index was not present.");
            return;
        }
        throw error;
    }
}
async function main() {
    const shouldApply = process.argv.includes("--apply");
    await connectDatabase();
    try {
        const plan = await buildMigrationPlan();
        printMigrationPlan(plan);
        if (!shouldApply) {
            console.log('Dry-run only. Review the mapping above. Use "--apply" to execute the migration.');
            return;
        }
        const session = await mongoose.startSession();
        try {
            await session.withTransaction(async () => {
                const freshPlan = await buildMigrationPlan(session);
                await applyMigration(session, freshPlan);
            });
        }
        finally {
            await session.endSession();
        }
        await removeLegacyIndex();
        console.log("\n========== MIGRATION COMPLETED ==========");
        console.log(`Products updated: ${plan.products.length}`);
        console.log("Shared categories ready: 5");
        console.log("Legacy categories removed.");
        console.log("Product audiences were preserved.");
        console.log("=========================================\n");
    }
    finally {
        await mongoose.disconnect();
    }
}
main().catch((error) => {
    console.error("\nCATEGORY MIGRATION FAILED:");
    console.error(error);
    process.exitCode = 1;
});
