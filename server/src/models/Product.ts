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

    price: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: (value: number) => Number.isFinite(value) && value > 0,
        message: "Price must be a finite positive number",
      },
    },

    compareAtPrice: {
      type: Number,
      min: 0,
      validate: [
        {
          validator: (value: number | undefined) =>
            value === undefined || (Number.isFinite(value) && value > 0),
          message: "Compare-at price must be a finite positive number",
        },
        {
          validator: function (
            this: { price?: number },
            value: number | undefined,
          ) {
            return (
              value === undefined ||
              (this.price !== undefined && value > this.price)
            );
          },
          message: "Compare-at price must be greater than the selling price",
        },
      ],
    },

    sku: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      maxlength: 64,
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
productSchema.index({ sku: 1 }, { unique: true });
productSchema.index({ category: 1, status: 1 });
productSchema.index({ status: 1, createdAt: -1 });

export type ProductDocument = InferSchemaType<typeof productSchema>;

const Product =
  (mongoose.models.Product as Model<ProductDocument> | undefined) ??
  mongoose.model<ProductDocument>("Product", productSchema);

export default Product;
