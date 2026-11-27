import mongoose from "mongoose";
const adminSessionSchema = new mongoose.Schema({
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
}, {
    timestamps: true,
    versionKey: false,
});
// MongoDB automatically removes expired sessions.
// Authentication logic must still check expiresAt explicitly.
adminSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
const AdminSession = mongoose.models.AdminSession ??
    mongoose.model("AdminSession", adminSessionSchema);
export default AdminSession;
