import mongoose from "mongoose";

interface HealthStatus {
  status: "healthy" | "unhealthy";
  services: {
    api: "healthy";
    database: "connected" | "disconnected";
  };
}

export const getHealthStatus = (): HealthStatus => {
  const isDatabaseConnected = mongoose.connection.readyState === 1;

  return {
    status: isDatabaseConnected ? "healthy" : "unhealthy",
    services: {
      api: "healthy",
      database: isDatabaseConnected ? "connected" : "disconnected",
    },
  };
};