import express from "express";
import cors from "cors";
import helmet from "helmet";
import "./config/env.js";
import connectDB from "./config/db.js";
import chatRoutes from "./routes/chatRoutes.js";
import logger from "./middleware/logger.js";
import errorHandler from "./middleware/errorHandler.js";
import notFound from "./middleware/notFound.js";
import { perMinuteLimiter, perDayLimiter } from "./middleware/rateLimiter.js";

const app = express();
const PORT = process.env.PORT || 8080;

connectDB();

app.use(helmet());

app.use(
  cors({
    origin: ["https://www.orvexa.xyz", "https://orvexa.xyz"],
    credentials: true,
  }),
);

app.use(logger);
app.use(express.json());
app.use("/api/chat", perMinuteLimiter, perDayLimiter);
app.use("/api", chatRoutes);

app.get("/health", (req, res) => {
  res.json({
    success: true,
    status: "OK",
  });
});

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});