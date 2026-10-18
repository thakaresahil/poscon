import express from "express";
import cors from "cors";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import { config } from "./config/env.js";
import db from "./config/db.js";
import productRoutes from "./routes/productRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import openapi from "./docs/openapi.js";

const app = express();

app.set("trust proxy", config.trustProxy);

app.use(helmet());
app.use(cors({ origin: config.clientOrigins }));
app.use(express.json({ limit: "10kb" }));

// Used by the hosting platform to check the API and database are up
app.get("/health", async (req, res) => {
  try {
    await db.query("SELECT 1");
    res.json({ status: "ok" });
  } catch {
    res.status(503).json({ status: "error", error: "Database unavailable" });
  }
});

// Interactive API docs
app.get("/docs/openapi.json", (req, res) => res.json(openapi));
app.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(openapi, {
    customSiteTitle: "Poscon API Docs",
    swaggerOptions: { persistAuthorization: true },
  })
);

app.use(productRoutes);
app.use(authRoutes);
app.use(cartRoutes);
app.use(profileRoutes);
app.use(orderRoutes);
app.use(adminRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
