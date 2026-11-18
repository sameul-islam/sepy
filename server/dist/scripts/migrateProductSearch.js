import "dotenv/config";
import mongoose from "mongoose";
import connectDatabase from "../config/database.js";
import Category from "../models/Category.js";
import Product from "../models/Product.js";
import Variant from "../models/Variant.js";
function normalizeColors(colors) {
    return [
        ...new Set(colors.map((color) => color.trim().toLowerCase()).filter(Boolean)),
    ].sort();
}
function metadataMatches(first, second) {
    return (first.categoryName === second.categoryName &&
        JSON.stringify(normalizeColors(first.colors)) ===
            JSON.stringify(normalizeColors(second.colors)));
}
async function buildMigrationPlan(session) {
    let productQuery = Product.find()
        .select("_id name category search.categoryName search.colors")
        .lean();
    if (session) {
        productQuery = productQuery.session(session);
    }
    const products = (await productQuery);
    if (products.length === 0) {
        throw new Error("No products found. Migration stopped.");
    }
    const productIds = products.map((product) => product._id);
    let categoryQuery = Category.find({
        _id: {
            $in: products.map((product) => product.category),
        },
    })
        .select("_id name")
        .lean();
    if (session) {
        categoryQuery = categoryQuery.session(session);
    }
    const categories = (await categoryQuery);
    const categoryById = new Map(categories.map((category) => [category._id.toString(), category]));
    const missingCategories = products.filter((product) => !categoryById.has(product.category.toString()));
    if (missingCategories.length > 0) {
        throw new Error([
            "Some products reference missing categories.",
            ...missingCategories.map((product) => `${product.name} (${product._id})`),
            "Migration stopped to prevent incomplete search metadata.",
        ].join("\n"));
    }
    const variantColorQuery = Variant.aggregate([
        {
            $match: {
                product: { $in: productIds },
                isActive: true,
                color: { $type: "string" },
            },
        },
        {
            $group: {
                _id: "$product",
                colors: { $addToSet: "$color" },
            },
        },
    ]);
    if (session) {
        variantColorQuery.session(session);
    }
    const variantColorGroups = await variantColorQuery;
    const colorsByProductId = new Map(variantColorGroups.map((group) => [
        group._id.toString(),
        normalizeColors(group.colors),
    ]));
    return products.map((product) => {
        const category = categoryById.get(product.category.toString());
        if (!category) {
            throw new Error(`Category not found for product "${product.name}".`);
        }
        const proposed = {
            categoryName: category.name.trim().toLowerCase(),
            colors: colorsByProductId.get(product._id.toString()) ?? [],
        };
        if (proposed.colors.length > 30) {
            throw new Error(`Product "${product.name}" has more than 30 unique active variant colors. Migration stopped.`);
        }
        return {
            product,
            current: {
                categoryName: product.search?.categoryName ?? "",
                colors: product.search?.colors ?? [],
            },
            proposed,
        };
    });
}
function printMigrationPlan(plan) {
    let changedCount = 0;
    let unchangedCount = 0;
    console.log("\n========== PRODUCT SEARCH MIGRATION ==========\n");
    for (const item of plan) {
        const changed = !metadataMatches(item.current, item.proposed);
        if (changed) {
            changedCount += 1;
        }
        else {
            unchangedCount += 1;
        }
        console.log(`${changed ? "[UPDATE]" : "[UNCHANGED]"} ${item.product.name}`);
        console.log(`  Current category:  ${item.current.categoryName || "None"}`);
        console.log(`  Proposed category: ${item.proposed.categoryName}`);
        console.log(`  Current colors:    ${item.current.colors.join(", ") || "None"}`);
        console.log(`  Proposed colors:   ${item.proposed.colors.join(", ") || "None"}`);
        console.log("");
    }
    console.log("Summary:");
    console.log(`  Total products: ${plan.length}`);
    console.log(`  Products to update: ${changedCount}`);
    console.log(`  Already matching: ${unchangedCount}`);
    console.log("\nNo database changes have been made yet.");
    console.log("================================================\n");
}
async function applyMigration(session) {
    // Rebuild the plan inside the transaction using fresh database data.
    const plan = await buildMigrationPlan(session);
    let updatedCount = 0;
    for (const item of plan) {
        if (metadataMatches(item.current, item.proposed)) {
            continue;
        }
        const result = await Product.updateOne({ _id: item.product._id }, {
            $set: {
                "search.categoryName": item.proposed.categoryName,
                "search.colors": item.proposed.colors,
            },
        }, {
            session,
            runValidators: true,
        });
        if (result.matchedCount !== 1) {
            throw new Error(`Could not safely update "${item.product.name}". Transaction will be rolled back.`);
        }
        updatedCount += result.modifiedCount;
    }
    // Verify all metadata again inside the same transaction.
    const verifiedPlan = await buildMigrationPlan(session);
    for (const item of verifiedPlan) {
        if (!metadataMatches(item.current, item.proposed)) {
            throw new Error(`Search metadata verification failed for "${item.product.name}". Transaction will be rolled back.`);
        }
    }
    return updatedCount;
}
async function main() {
    const shouldApply = process.argv.includes("--apply");
    await connectDatabase();
    try {
        const plan = await buildMigrationPlan();
        printMigrationPlan(plan);
        if (!shouldApply) {
            console.log('Dry-run only. Use "npx tsx src/scripts/migrateProductSearch.ts --apply" to execute the migration.');
            return;
        }
        const session = await mongoose.startSession();
        let updatedCount = 0;
        try {
            await session.withTransaction(async () => {
                updatedCount = await applyMigration(session);
            });
        }
        finally {
            await session.endSession();
        }
        console.log("\n========== MIGRATION COMPLETED ==========");
        console.log(`Products updated: ${updatedCount}`);
        console.log(`Products verified: ${plan.length}`);
        console.log("All Search Metadata values verified successfully.");
        console.log("==========================================\n");
    }
    finally {
        await mongoose.disconnect();
    }
}
main().catch((error) => {
    console.error("\nPRODUCT SEARCH MIGRATION FAILED:");
    console.error(error);
    process.exitCode = 1;
});
