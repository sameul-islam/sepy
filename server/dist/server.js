import app from "./app.js";
import connectDatabase from "./config/database.js";
import { env } from "./config/env.js";
const startServer = async () => {
    await connectDatabase();
    app.listen(env.PORT, () => {
        console.log(`SEPY API running on port ${env.PORT}`);
    });
};
void startServer().catch((error) => {
    console.error("SEPY API startup failed.", error);
    process.exitCode = 1;
});
