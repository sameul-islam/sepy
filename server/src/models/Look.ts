import mongoose, { type InferSchemaType, type Model } from "mongoose";

const lookProductSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    sortOrder: {
      type: Number,
      required: true,
      min: 0,
      max: Number.MAX_SAFE_INTEGER,
    },

    color: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 60,
    },
  },
  {
    _id: false,
  },
);

const lookSchema = new mongoose.Schema(
  {
    title: {
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
      match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    },

    eyebrow: {
      type: String,
      trim: true,
      maxlength: 80,
    },

    image: {
      url: {
        type: String,
        required: true,
        trim: true,
        maxlength: 2048,
      },

      alt: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200,
      },
    },

    products: {
      type: [lookProductSchema],
      required: true,
      validate: [
        {
          validator: (products: unknown[]) =>
            products.length >= 1 && products.length <= 8,
          message: "A Look must contain between 1 and 8 products",
        },
        {
          validator: (products: { product: mongoose.Types.ObjectId }[]) => {
            const ids = products.map((item) => item.product.toString());

            return new Set(ids).size === ids.length;
          },
          message: "A product can only appear once in a Look",
        },
      ],
    },

    isActive: {
      type: Boolean,
      default: false,
      required: true,
    },

    sortOrder: {
      type: Number,
      default: 0,
      required: true,
      min: 0,
      max: Number.MAX_SAFE_INTEGER,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

lookSchema.index({ slug: 1 }, { unique: true });
lookSchema.index({ isActive: 1, sortOrder: 1 });

export type LookDocument = InferSchemaType<typeof lookSchema>;

const Look =
  (mongoose.models.Look as Model<LookDocument> | undefined) ??
  mongoose.model<LookDocument>("Look", lookSchema);

export default Look;
