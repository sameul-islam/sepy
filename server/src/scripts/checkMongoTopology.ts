import "dotenv/config";
import mongoose from "mongoose";

import connectDatabase from "../config/database.js";

async function main(): Promise<void> {
  await connectDatabase();

  try {
    const database = mongoose.connection.db;

    if (!database) {
      throw new Error("MongoDB database connection is not available.");
    }

    const hello = await database.admin().command({ hello: 1 });

    const topology = hello.msg === "isdbgrid"
      ? "Sharded cluster (mongos)"
      : hello.setName
        ? "Replica set"
        : "Standalone";

    console.log("\n========== MONGODB TOPOLOGY ==========");
    console.log("Connected host:", mongoose.connection.host);
    console.log("Database:", mongoose.connection.name);
    console.log("Topology:", topology);
    console.log("Replica set:", hello.setName ?? "Not available");
    console.log("Writable primary:", hello.isWritablePrimary ?? false);
    console.log("======================================\n");
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((error: unknown) => {
  console.error("MongoDB topology check failed:", error);
  process.exitCode = 1;
});