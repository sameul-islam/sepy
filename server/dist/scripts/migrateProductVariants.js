import mongoose from "mongoose";
import connectDatabase from "../config/database.js";
import Product from "../models/Product.js";
import Variant from "../models/Variant.js";
const migrateProductVariants = async () => {
    try {
        await connectDatabase();
        const products = await Product.find()
            .select("_id price compareAtPrice sku")
            .lean();
        let created = 0;
        let skipped = 0;
        for (const product of products) {
            const existingVariant = await Variant.findOne({
                sku: product.sku,
            }).lean();
            if (existingVariant) {
                if (existingVariant.product.toString() !== product._id.toString()) {
                    throw new Error(`SKU conflict: ${product.sku} belongs to a different product.`);
                }
                skipped++;
                continue;
            }
            await Variant.create({
                product: product._id,
                sku: product.sku,
                price: product.price,
                ...(product.compareAtPrice !== undefined
                    ? { compareAtPrice: product.compareAtPrice }
                    : {}),
                stock: 0,
                isActive: true,
            });
            created++;
        }
        console.log("Product variant migration completed.");
        console.log(`Products checked: ${products.length}`);
        console.log(`Variants created: ${created}`);
        console.log(`Existing variants skipped: ${skipped}`);
        console.log("Stock was initialized to 0 for every new variant.");
    }
    catch (error) {
        console.error("Product variant migration failed:", error);
        process.exitCode = 1;
    }
    finally {
        try {
            await mongoose.disconnect();
        }
        catch (error) {
            console.error("MongoDB disconnection failed:", error);
            process.exitCode = 1;
        }
    }
};
void migrateProductVariants();
