import mongoose, { type InferSchemaType, type Model } from "mongoose";

const categoryImagesSchema = new mongoose.Schema(
  {
    women: {
      type: String,
      trim: true,
      maxlength: 2048,
    },

    men: {
      type: String,
      trim: true,
      maxlength: 2048,
    },

    default: {
      type: String,
      trim: true,
      maxlength: 2048,
    },
  },
  {
    _id: false,
  },
);

const categorySchema = new mongoose.Schema(
  {
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

    images: {
      type: categoryImagesSchema,
      default: () => ({}),
    },

    isActive: {
      type: Boolean,
      default: true,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

categorySchema.index({ slug: 1 }, { unique: true });

export type CategoryDocument = InferSchemaType<typeof categorySchema>;

const Category =
  (mongoose.models.Category as Model<CategoryDocument> | undefined) ??
  mongoose.model<CategoryDocument>("Category", categorySchema);

export default Category;
