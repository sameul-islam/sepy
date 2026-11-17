import mongoose from "mongoose";
const MAX_FEATURED_CATEGORIES = 4;
const homepageCategoryConfigSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: "homepage-category-config",
    },
    women: {
        type: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Category",
            },
        ],
        default: [],
        validate: {
            validator: (ids) => ids.length <= MAX_FEATURED_CATEGORIES &&
                new Set(ids.map(String)).size === ids.length,
            message: "Women can have a maximum of four unique featured categories",
        },
    },
    men: {
        type: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Category",
            },
        ],
        default: [],
        validate: {
            validator: (ids) => ids.length <= MAX_FEATURED_CATEGORIES &&
                new Set(ids.map(String)).size === ids.length,
            message: "Men can have a maximum of four unique featured categories",
        },
    },
}, {
    timestamps: true,
    versionKey: false,
});
const HomepageCategoryConfig = mongoose.models.HomepageCategoryConfig ??
    mongoose.model("HomepageCategoryConfig", homepageCategoryConfigSchema);
export default HomepageCategoryConfig;
