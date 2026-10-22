import mongoose from "mongoose";
const variantSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
        index: true,
    },
    sku: {
        type: String,
        required: true,
        trim: true,
        uppercase: true,
        maxlength: 64,
    },
    size: {
        type: String,
        trim: true,
        uppercase: true,
        maxlength: 40,
    },
    color: {
        type: String,
        trim: true,
        lowercase: true,
        maxlength: 60,
    },
    price: {
        type: Number,
        required: true,
        min: 0,
        validate: {
            validator: (value) => Number.isFinite(value) && value > 0,
            message: "Price must be a finite positive number",
        },
    },
    compareAtPrice: {
        type: Number,
        min: 0,
        validate: [
            {
                validator: (value) => value === undefined || (Number.isFinite(value) && value > 0),
                message: "Compare-at price must be a finite positive number",
            },
            {
                validator: function (value) {
                    return (value === undefined ||
                        (this.price !== undefined && value > this.price));
                },
                message: "Compare-at price must be greater than the selling price",
            },
        ],
    },
    stock: {
        type: Number,
        required: true,
        default: 0,
        min: 0,
        validate: {
            validator: (value) => Number.isSafeInteger(value) && value >= 0,
            message: "Stock must be a non-negative integer",
        },
    },
    isActive: {
        type: Boolean,
        required: true,
        default: true,
    },
}, {
    timestamps: true,
    versionKey: false,
});
variantSchema.index({ sku: 1 }, { unique: true });
variantSchema.index({ product: 1, isActive: 1 });
variantSchema.index({ product: 1, size: 1, color: 1 }, {
    unique: true,
    partialFilterExpression: {
        size: { $type: "string" },
        color: { $type: "string" },
    },
});
const Variant = mongoose.models.Variant ??
    mongoose.model("Variant", variantSchema);
export default Variant;
