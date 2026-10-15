import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        maxlength: 254,
    },
    passwordHash: {
        type: String,
        required: true,
        select: false,
    },
    role: {
        type: String,
        enum: ["admin"],
        default: "admin",
        required: true,
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
userSchema.index({ email: 1 }, { unique: true });
const User = mongoose.models.User ??
    mongoose.model("User", userSchema);
export default User;
