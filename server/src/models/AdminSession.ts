import mongoose, { type InferSchemaType, type Model } from "mongoose";

const adminSessionSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    refreshTokenHash: {
      type: String,
      required: true,
      unique: true,
      select: false,
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    revokedAt: {
      type: Date,
      default: null,
    },

    lastUsedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// MongoDB automatically removes expired sessions.
// Authentication logic must still check expiresAt explicitly.
adminSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export type AdminSessionDocument = InferSchemaType<typeof adminSessionSchema>;

const AdminSession =
  (mongoose.models.AdminSession as Model<AdminSessionDocument> | undefined) ??
  mongoose.model<AdminSessionDocument>("AdminSession", adminSessionSchema);

export default AdminSession;
