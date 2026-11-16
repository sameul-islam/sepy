import "dotenv/config";
import mongoose from "mongoose";
import connectDatabase from "../config/database.js";
import Product from "../models/Product.js";
const PRODUCT_ACTIVITY_MAP = [
    { name: "SEPY Essential Performance Cap", activity: ["Everyday Movement"] },
    { name: "SEPY Studio Essential Crewneck", activity: ["Everyday Movement"] },
    { name: "SEPY Essential Unisex T-Shirt", activity: ["Everyday Movement"] },
    { name: "SEPY Skyline Casual Shirt", activity: [] },
    { name: "SEPY Heritage Rugby Polo", activity: [] },
    { name: "SEPY Flex Training Shorts", activity: ["Training"] },
    { name: "SEPY Motion Essential Sweatpants", activity: ["Everyday Movement"] },
    { name: "SEPY Core Performance T-Shirt", activity: ["Training"] },
    { name: "SEPY Essential Pullover Hoodie", activity: ["Everyday Movement"] },
    { name: "SEPY Motion Training Shorts", activity: ["Training"] },
    { name: "SEPY Core Knit Sweater", activity: ["Everyday Movement"] },
    { name: "SEPY Heritage Varsity Jacket", activity: ["Everyday Movement"] },
    { name: "SEPY Flow Performance Joggers", activity: ["Training"] },
    {
        name: "SEPY Mini Sculpt Sports Bra",
        activity: ["Training", "Running", "Yoga & Studio"],
    },
    {
        name: "SEPY Sculpt Performance Tank",
        activity: ["Training", "Yoga & Studio"],
    },
];
const EXPECTED_CURRENT_ACTIVITY = {
    "SEPY Essential Performance Cap": ["Activewear", "Everyday wear"],
    "SEPY Studio Essential Crewneck": ["Activewear", "Everyday wear"],
    "SEPY Essential Unisex T-Shirt": ["Activewear", "Everyday wear"],
    "SEPY Skyline Casual Shirt": ["Everyday wear", "Activewear"],
    "SEPY Heritage Rugby Polo": ["Activewear", "Everyday wear"],
    "SEPY Flex Training Shorts": ["Training", "Activewear", "Everyday wear"],
    "SEPY Motion Essential Sweatpants": ["Activewear", "Everyday wear"],
    "SEPY Core Performance T-Shirt": ["Everyday wear", "Activewear"],
    "SEPY Essential Pullover Hoodie": ["Activewear", "Everyday wear"],
    "SEPY Motion Training Shorts": ["Activewear", "Training"],
    "SEPY Core Knit Sweater": ["Activewear", "Everyday wear"],
    "SEPY Heritage Varsity Jacket": ["Activewear", "Everyday wear"],
    "SEPY Flow Performance Joggers": ["Activewear", "Everyday wear"],
    "SEPY Mini Sculpt Sports Bra": ["Activewear"],
    "SEPY Sculpt Performance Tank": ["Activewear", "Everyday wear"],
};
function normalizeActivities(activities) {
    return [...activities].sort();
}
function activitiesMatch(first, second) {
    return (JSON.stringify(normalizeActivities(first)) ===
        JSON.stringify(normalizeActivities(second)));
}
async function buildMigrationPlan(session) {
    let query = Product.find({
        name: {
            $in: PRODUCT_ACTIVITY_MAP.map((item) => item.name),
        },
    })
        .select("_id name details.activity")
        .lean();
    if (session) {
        query = query.session(session);
    }
    const products = (await query);
    if (products.length !== PRODUCT_ACTIVITY_MAP.length) {
        throw new Error(`Expected ${PRODUCT_ACTIVITY_MAP.length} products, but found ${products.length}. Migration stopped.`);
    }
    const productByName = new Map(products.map((product) => [product.name, product]));
    if (productByName.size !== PRODUCT_ACTIVITY_MAP.length) {
        throw new Error("Duplicate product names were found. Migration stopped.");
    }
    for (const mapping of PRODUCT_ACTIVITY_MAP) {
        if (!productByName.has(mapping.name)) {
            throw new Error(`Product not found: ${mapping.name}`);
        }
    }
    return products;
}
function verifyExpectedCurrentActivities(products) {
    const productByName = new Map(products.map((product) => [product.name, product]));
    for (const [name, expectedActivities] of Object.entries(EXPECTED_CURRENT_ACTIVITY)) {
        const product = productByName.get(name);
        if (!product) {
            throw new Error(`Product not found during snapshot verification: ${name}`);
        }
        const currentActivities = product.details?.activity ?? [];
        if (!activitiesMatch(currentActivities, expectedActivities)) {
            throw new Error([
                `Activity snapshot mismatch for "${name}".`,
                `Expected: ${expectedActivities.join(", ") || "None"}`,
                `Current: ${currentActivities.join(", ") || "None"}`,
                "Migration stopped to prevent overwriting unexpected changes.",
            ].join("\n"));
        }
    }
}
function printMigrationPlan(products) {
    const productByName = new Map(products.map((product) => [product.name, product]));
    let changedCount = 0;
    let unchangedCount = 0;
    console.log("\n========== PRODUCT ACTIVITY MIGRATION ==========\n");
    for (const mapping of PRODUCT_ACTIVITY_MAP) {
        const product = productByName.get(mapping.name);
        if (!product) {
            throw new Error(`Product not found: ${mapping.name}`);
        }
        const current = product.details?.activity ?? [];
        const proposed = [...mapping.activity];
        const changed = !activitiesMatch(current, proposed);
        if (changed) {
            changedCount += 1;
        }
        else {
            unchangedCount += 1;
        }
        console.log(`${changed ? "[UPDATE]" : "[UNCHANGED]"} ${product.name}`);
        console.log(`  Current:   ${current.join(", ") || "None"}`);
        console.log(`  Proposed:  ${proposed.join(", ") || "None"}\n`);
    }
    console.log("Summary:");
    console.log(`  Total products: ${PRODUCT_ACTIVITY_MAP.length}`);
    console.log(`  Products to update: ${changedCount}`);
    console.log(`  Already matching: ${unchangedCount}`);
    console.log("\nNo database changes have been made yet.");
    console.log("================================================\n");
}
async function applyMigration(session) {
    const freshProducts = await buildMigrationPlan(session);
    // Stop if the database no longer matches the reviewed dry-run snapshot.
    verifyExpectedCurrentActivities(freshProducts);
    const productByName = new Map(freshProducts.map((product) => [product.name, product]));
    let updatedCount = 0;
    for (const mapping of PRODUCT_ACTIVITY_MAP) {
        const product = productByName.get(mapping.name);
        if (!product) {
            throw new Error(`Product not found during update: ${mapping.name}`);
        }
        const result = await Product.updateOne({ _id: product._id, name: mapping.name }, {
            $set: {
                "details.activity": [...mapping.activity],
            },
        }, {
            session,
            runValidators: true,
        });
        if (result.matchedCount !== 1) {
            throw new Error(`Could not safely update "${mapping.name}". Transaction will be rolled back.`);
        }
        if (result.modifiedCount === 1) {
            updatedCount += 1;
        }
    }
    // Verify every product inside the same transaction.
    const verifiedProducts = await buildMigrationPlan(session);
    const verifiedByName = new Map(verifiedProducts.map((product) => [product.name, product]));
    for (const mapping of PRODUCT_ACTIVITY_MAP) {
        const product = verifiedByName.get(mapping.name);
        if (!product) {
            throw new Error(`Verification failed: product not found: ${mapping.name}`);
        }
        const actual = product.details?.activity ?? [];
        const expected = [...mapping.activity];
        if (!activitiesMatch(actual, expected)) {
            throw new Error(`Activity verification failed for "${mapping.name}". Transaction will be rolled back.`);
        }
    }
    return updatedCount;
}
async function main() {
    const shouldApply = process.argv.includes("--apply");
    await connectDatabase();
    try {
        const products = await buildMigrationPlan();
        printMigrationPlan(products);
        if (!shouldApply) {
            console.log('Dry-run only. Use "npx tsx src/scripts/migrateProductActivities.ts --apply" to execute the migration.');
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
        console.log(`Products verified: ${PRODUCT_ACTIVITY_MAP.length}`);
        console.log("All Activity values verified successfully.");
        console.log("==========================================\n");
    }
    finally {
        await mongoose.disconnect();
    }
}
main().catch((error) => {
    console.error("\nPRODUCT ACTIVITY MIGRATION FAILED:");
    console.error(error);
    process.exitCode = 1;
});
