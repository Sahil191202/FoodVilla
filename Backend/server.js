import dotenv from "dotenv";
dotenv.config();

import { app } from "./src/app.js";
import { ENV } from "./src/config/env.js";
import { connectDB } from "./src/config/db.js";
import { startCronJobs } from "./src/jobs/cron.js";

connectDB().then(() => {
  app.listen(ENV.PORT, () => {
    console.log(`✅Server running on port ${ENV.PORT}`);
    startCronJobs();
  });
}).catch((err) => {
  console.error("MongoDB connection failed!", err);
  process.exit(1);
});