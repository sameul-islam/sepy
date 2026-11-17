import "dotenv/config";
import mongoose from "mongoose";
import connectDatabase from "../config/database.js";
import Category from "../models/Category.js";
import HomepageCategoryConfig from "../models/HomepageCategoryConfig.js";
const HOMEPAGE_CONFIG_ID = "homepage-category-config";
const CATEGORY_IMAGE_MAP = [
    {
        slug: "tops",
        images: {
            women: "https://res.cloudinary.com/dyqilvkjw/image/upload/v1794899413/07_run_tank_woman_1600x2000_zrw5a0.webp",
            men: "https://res.cloudinary.com/dyqilvkjw/image/upload/v1794899413/04_black_tank_man_1600x2000_f4kvbh.webp",
        },
    },
    {
        slug: "bottoms",
        images: {
            women: "https://res.cloudinary.com/dyqilvkjw/image/upload/v1794899414/01_tennis_woman_1600x2000_sddxee.webp",
            men: "https://res.cloudinary.com/dyqilvkjw/image/upload/v1794899413/06_gym_shorts_man_1600x2000_ecqya1.webp",
        },
    },
    {
        slug: "hoodies",
        images: {
            women: "https://res.cloudinary.com/dyqilvkjw/image/upload/v1794899413/05_superdry_hoodie_woman_1600x2000_hvou2c.webp",
            men: "https://res.cloudinary.com/dyqilvkjw/image/upload/v1794899413/02_hoodie_man_1600x2000_picaon.webp",
        },
    },
    {
        slug: "outerwear",
        images: {
            women: "https://res.cloudinary.com/dyqilvkjw/image/upload/v1794899413/03_brown_tracksuit_woman_1600x2000_nqcmvq.webp",
            men: "https://res.cloudinary.com/dyqilvkjw/image/upload/v1794899413/08_quarterzip_man_1600x2000_ljmsls.webp",
        },
    },
];
async function buildMigrationPlan(session) {
    const categoryQuery = Category.find({
        slug: {
            $in: CATEGORY_IMAGE_MAP.map((item) => item.slug),
        },
    })
        .select("_id name slug images isActive")
        .lean();
    const configQuery = HomepageCategoryConfig.findById(HOMEPAGE_CONFIG_ID)
        .select("_id women men")
        .lean();
    // Never execute operations concurrently on the same transaction session.
    const categories = session
        ? await categoryQuery.session(session)
        : await categoryQuery;
    const existingConfig = session
        ? await configQuery.session(session)
        : await configQuery;
    const foundCategories = categories;
    if (foundCategories.length !== CATEGORY_IMAGE_MAP.length) {
        const foundSlugs = new Set(foundCategories.map((category) => category.slug));
        const missing = CATEGORY_IMAGE_MAP.filter((item) => !foundSlugs.has(item.slug)).map((item) => item.slug);
        throw new Error(`Required categories are missing: ${missing.join(", ")}`);
    }
    const categoryBySlug = new Map(foundCategories.map((category) => [category.slug, category]));
    for (const mapping of CATEGORY_IMAGE_MAP) {
        const category = categoryBySlug.get(mapping.slug);
        if (!category) {
            throw new Error(`Category not found: ${mapping.slug}`);
        }
        if (!category.isActive) {
            throw new Error(`Category "${mapping.slug}" is inactive. Migration stopped.`);
        }
        for (const department of ["women", "men"]) {
            const currentImage = category.images?.[department];
            const proposedImage = mapping.images[department];
            if (currentImage && currentImage !== proposedImage) {
                throw new Error([
                    `Existing image conflict for "${mapping.slug}" (${department}).`,
                    "The current image is different from the proposed image.",
                    "Migration stopped to prevent overwriting unexpected changes.",
                ].join("\n"));
            }
        }
    }
    return {
        categories: foundCategories,
        configExists: Boolean(existingConfig),
    };
}
function printMigrationPlan(plan) {
    const categoryBySlug = new Map(plan.categories.map((category) => [category.slug, category]));
    console.log("\n========== HOMEPAGE CATEGORY INITIALIZATION ==========\n");
    for (const mapping of CATEGORY_IMAGE_MAP) {
        const category = categoryBySlug.get(mapping.slug);
        if (!category) {
            throw new Error(`Category not found: ${mapping.slug}`);
        }
        console.log(`[CATEGORY] ${category.name}`);
        console.log(`  Slug: ${category.slug}`);
        console.log(`  ID: ${category._id}`);
        console.log(`  Women image: ${category.images?.women ? "[ALREADY SET]" : "[WILL BE ADDED]"}`);
        console.log(`  Men image: ${category.images?.men ? "[ALREADY SET]" : "[WILL BE ADDED]"}`);
        console.log("");
    }
    console.log("[HOMEPAGE CONFIGURATION]");
    if (plan.configExists) {
        console.log("  Existing configuration found.");
        console.log("  It will be preserved without modification.");
    }
    else {
        console.log("  No existing configuration found.");
        console.log("  Women: Tops, Bottoms, Hoodies, Outerwear");
        console.log("  Men: Tops, Bottoms, Hoodies, Outerwear");
        console.log("  A new configuration will be created.");
    }
    console.log("\nNo database changes have been made yet.");
    console.log("=======================================================\n");
}
async function applyMigration(session) {
    const plan = await buildMigrationPlan(session);
    const categoryBySlug = new Map(plan.categories.map((category) => [category.slug, category]));
    // Update the category images.
    for (const mapping of CATEGORY_IMAGE_MAP) {
        const category = categoryBySlug.get(mapping.slug);
        if (!category) {
            throw new Error(`Category not found: ${mapping.slug}`);
        }
        const result = await Category.updateOne({
            _id: category._id,
            slug: mapping.slug,
            isActive: true,
        }, {
            $set: {
                "images.women": mapping.images.women,
                "images.men": mapping.images.men,
            },
        }, {
            session,
            runValidators: true,
        });
        if (result.matchedCount !== 1) {
            throw new Error(`Could not safely update category "${mapping.slug}". Transaction will be rolled back.`);
        }
    }
    // Create the initial homepage configuration only if it does not exist.
    if (!plan.configExists) {
        const womenCategoryIds = CATEGORY_IMAGE_MAP.map((item) => categoryBySlug.get(item.slug)._id);
        const menCategoryIds = [...womenCategoryIds];
        const config = new HomepageCategoryConfig({
            _id: HOMEPAGE_CONFIG_ID,
            women: womenCategoryIds,
            men: menCategoryIds,
        });
        await config.save({ session });
    }
    // Verify category images inside the same transaction.
    const verifiedPlan = await buildMigrationPlan(session);
    const verifiedBySlug = new Map(verifiedPlan.categories.map((category) => [category.slug, category]));
    for (const mapping of CATEGORY_IMAGE_MAP) {
        const category = verifiedBySlug.get(mapping.slug);
        if (!category) {
            throw new Error(`Verification failed: ${mapping.slug} was not found.`);
        }
        for (const department of ["women", "men"]) {
            if (category.images?.[department] !== mapping.images[department]) {
                throw new Error(`Image verification failed: ${mapping.slug} (${department}). Transaction will be rolled back.`);
            }
        }
    }
    // Verify that the initial configuration exists.
    if (!verifiedPlan.configExists) {
        throw new Error("Homepage configuration verification failed. Transaction will be rolled back.");
    }
}
async function main() {
    const shouldApply = process.argv.includes("--apply");
    await connectDatabase();
    try {
        const plan = await buildMigrationPlan();
        printMigrationPlan(plan);
        if (!shouldApply) {
            console.log('Dry-run only. Use "npx tsx src/scripts/initializeHomepageCategories.ts --apply" to execute.');
            return;
        }
        const session = await mongoose.startSession();
        try {
            await session.withTransaction(async () => {
                await applyMigration(session);
            });
        }
        finally {
            await session.endSession();
        }
        console.log("\n========== INITIALIZATION COMPLETED ==========");
        console.log("Category images: Verified successfully.");
        console.log("Homepage configuration: Verified successfully.");
        console.log("Accessories: Unchanged.");
        console.log("All database changes committed successfully.");
        console.log("===============================================\n");
    }
    finally {
        await mongoose.disconnect();
    }
}
main().catch((error) => {
    console.error("\nHOMEPAGE CATEGORY INITIALIZATION FAILED:");
    console.error(error);
    process.exitCode = 1;
});
