import dotenv from "dotenv";

const mode = process.env.NODE_ENV || "development";
console.log("MODE", mode, process.env.NODE_ENV);
const envFiles = [`.env.${mode}`, ".env"];
dotenv.config({ path: envFiles });

console.log(
  "PROCE",
  process.env.SPOTIFY_CLIENT_SECRET,
  process.env.SPOTIFY_CLIENT_ID,
  process.env.JWT_SECRET
);
import mongoose from "mongoose";
import express from "express";
import cors from "cors";
import router from "./routes";
import { errorHandler } from "./middleware/error-middleware";
import { asyncWrapper } from "./utils/async-wrapper";
import { httpErrors } from "./service/api-error";

const app = express();

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
const MONGODB_URL = process.env.MONGODB_URL;
const DB_NAME = process.env.DB_NAME;

app.use(cors()); // For now allow all.
app.use(express.json());

app.use("/api/v1", router);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "Okay" });
});

app.use(
  asyncWrapper(() => {
    throw httpErrors.notFound();
  })
);

app.use(errorHandler);

(async () => {
  try {
    await mongoose.connect(`${MONGODB_URL}/${DB_NAME}`);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Failed to connect to DB. Please check your db url");
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`API running on port ${PORT}`);
  });

  const cleanUpFn = async (err?: unknown) => {
    if (err) {
      console.error("Cleanup due to error:", err);
    }
    await mongoose.disconnect();
    process.exit(0);
  };

  process.on("unhandledRejection", async (reason) => {
    console.log("process.on('unhandledRejection') called with reason:", reason);
    await cleanUpFn(reason);
  });

  process.on("uncaughtException", async (err) => {
    console.log("process.on('uncaughtException') called with error:", err);
    await cleanUpFn(err);
  });
})();
