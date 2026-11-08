import mongoose from "mongoose";
const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100,
    },
    slug: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        maxlength: 120,
    },
    image: {
        type: String,
        trim: true,
        maxlength: 2048,
    },
    isActive: {
        type: Boolean,
        default: true,
        required: true,
    },
}, {
    timestamps: true,
    versionKey: false,
});
categorySchema.index({ slug: 1 }, { unique: true });
const Category = mongoose.models.Category ??
    mongoose.model("Category", categorySchema);
export default Category;
