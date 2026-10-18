import express from "express";
import cors from "cors";
import helmet from "helmet";
import { config } from "./config/env.js";
import productRoutes from "./routes/productRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";

const app = express();

app.use(helmet());
app.use(cors({ origin: config.clientOrigins }));
app.use(express.json({ limit: "10kb" }));

app.use(productRoutes);
app.use(authRoutes);
app.use(cartRoutes);
app.use(profileRoutes);
app.use(orderRoutes);
app.use(adminRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
