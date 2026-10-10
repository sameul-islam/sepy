import { sendSuccess } from "../utils/apiResponse.js";
import { getHealthStatus } from "../services/health.service.js";
export const getHealth = (_req, res) => {
    const health = getHealthStatus();
    sendSuccess(res, 200, "SEPY API is running", health);
};
