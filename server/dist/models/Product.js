import mongoose from "mongoose";
const productImageSchema = new mongoose.Schema({
    url: {
        type: String,
        required: true,
        trim: true,
    },
    alt: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200,
    },
}, {
    _id: false,
});
const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 160,
    },
    slug: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        maxlength: 180,
    },
    description: {
        type: String,
        required: true,
        trim: true,
        maxlength: 10000,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true,
    },
    images: {
        type: [productImageSchema],
        required: true,
        validate: {
            validator: (images) => images.length >= 1 && images.length <= 12,
            message: "A product must have between 1 and 12 images",
        },
    },
    status: {
        type: String,
        enum: ["draft", "active", "archived"],
        default: "draft",
        required: true,
    },
}, {
    timestamps: true,
    versionKey: false,
});
productSchema.index({ slug: 1 }, { unique: true });
productSchema.index({ category: 1, status: 1 });
productSchema.index({ status: 1, createdAt: -1 });
const Product = mongoose.models.Product ??
    mongoose.model("Product", productSchema);
export default Product;
