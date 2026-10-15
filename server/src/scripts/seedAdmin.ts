import "dotenv/config";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import connectDatabase from "../config/database.js";
import { env } from "../config/env.js";
import User from "../models/User.js";

const seedAdmin = async (): Promise<void> => {
  try {
    await connectDatabase();

    const email = env.ADMIN_EMAIL;
    const existingAdmin = await User.findOne({ email }).select("+passwordHash");

    if (existingAdmin) {
      console.log("Admin account already exists. No changes made.");
      return;
    }

    const passwordHash = await bcrypt.hash(env.ADMIN_PASSWORD, 12);

    await User.create({
      email,
      passwordHash,
      role: "admin",
      isActive: true,
    });

    console.log("Admin account created successfully.");
  } catch (error) {
    console.error("Admin account creation failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

void seedAdmin();