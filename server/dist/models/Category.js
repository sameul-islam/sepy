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
    department: {
        type: String,
        required: true,
        enum: ["women", "men"],
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
categorySchema.index({ department: 1, isActive: 1 });
const Category = mongoose.models.Category ??
    mongoose.model("Category", categorySchema);
export default Category;
