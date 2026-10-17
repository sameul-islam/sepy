
import mongoose from "mongoose";
import { env } from "./env.js";

const connectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(env.MONGODB_URI, {
      dbName: "sepy",
    });

    console.log(
      `MongoDB connected successfully to database: ${mongoose.connection.name}`,
    );
  } catch (error) {
    console.error("MongoDB connection failed.");
    throw error;
  }
};

export default connectDatabase;
