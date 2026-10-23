import mongoose, { type InferSchemaType, type Model } from "mongoose";

const productImageSchema = new mongoose.Schema(
  {
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

    publicId: {
      type: String,
      trim: true,
      maxlength: 255,
    },

    width: {
      type: Number,
      min: 1,
      validate: {
        validator: (value: number | undefined) =>
          value === undefined || Number.isSafeInteger(value),
        message: "Image width must be a positive integer",
      },
    },

    height: {
      type: Number,
      min: 1,
      validate: {
        validator: (value: number | undefined) =>
          value === undefined || Number.isSafeInteger(value),
        message: "Image height must be a positive integer",
      },
    },
  },
  {
    _id: false,
  },
);

const productDetailsSchema = new mongoose.Schema(
  {
    material: {
      type: String,
      trim: true,
      maxlength: 160,
    },

    fit: {
      type: String,
      trim: true,
      maxlength: 120,
    },

    careInstructions: {
      type: [String],
      default: [],
      validate: {
        validator: (items: string[]) =>
          items.length <= 12 &&
          items.every((item) => item.trim().length > 0 && item.length <= 240),
        message: "Care instructions must contain up to 12 valid items",
      },
    },

    activity: {
      type: [String],
      default: [],
      validate: {
        validator: (items: string[]) =>
          items.length <= 12 &&
          items.every((item) => item.trim().length > 0 && item.length <= 50),
        message: "Activity must contain up to 12 valid items",
      },
    },
  },
  {
    _id: false,
  },
);

const productSeoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      maxlength: 70,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 170,
    },
  },
  {
    _id: false,
  },
);

const productSchema = new mongoose.Schema(
  {
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
        validator: (images: unknown[]) =>
          images.length >= 1 && images.length <= 12,
        message: "A product must have between 1 and 12 images",
      },
    },

    isFeatured: {
      type: Boolean,
      required: true,
      default: false,
    },

    featuredOrder: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      validate: {
        validator: (value: number) => Number.isSafeInteger(value),
        message: "Featured order must be a non-negative integer",
      },
    },

    highlights: {
      type: [String],
      default: [],
      validate: {
        validator: (items: string[]) =>
          items.length <= 8 &&
          items.every((item) => item.trim().length > 0 && item.length <= 180),
        message: "Highlights must contain up to 8 valid items",
      },
    },

    details: {
      type: productDetailsSchema,
      default: () => ({}),
    },

    seo: {
      type: productSeoSchema,
      default: () => ({}),
    },

    status: {
      type: String,
      enum: ["draft", "active", "archived"],
      default: "draft",
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

productSchema.index({ slug: 1 }, { unique: true });
productSchema.index({ category: 1, status: 1 });
productSchema.index({ status: 1, createdAt: -1 });
productSchema.index({
  status: 1,
  isFeatured: 1,
  featuredOrder: 1,
  createdAt: -1,
});

export type ProductDocument = InferSchemaType<typeof productSchema>;

const Product =
  (mongoose.models.Product as Model<ProductDocument> | undefined) ??
  mongoose.model<ProductDocument>("Product", productSchema);

export default Product;
