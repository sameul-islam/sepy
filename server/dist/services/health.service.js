import mongoose from "mongoose";
export const getHealthStatus = () => {
    const isDatabaseConnected = mongoose.connection.readyState === 1;
    return {
        status: isDatabaseConnected ? "healthy" : "unhealthy",
        services: {
            api: "healthy",
            database: isDatabaseConnected ? "connected" : "disconnected",
        },
    };
};
