import express from "express";
import cors from "cors";
import "dotenv/config";
import mongoose from "mongoose";
import { clerkMiddleware } from "@clerk/express";
import connectDB from "./configs/db.js";
import clerkWebhooks from "./controllers/clerkWebhooks.js";
import userRoutes from "./routes/userRoutes.js";
import hotelRouter from "./routes/hotelRoutes.js";
import connectCloudinary from "./configs/cloudinary.js";
import roomRoutes from "./routes/roomRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";
import reviewRouter from "./routes/reviewRoutes.js";
import stripeWebhooks, { testWebhook } from "./controllers/stripeWebhooks.js";

connectDB();
connectCloudinary();
const app = express();
app.use(cors());

//api to listen for stripe webhooks
app.post("/api/stripe/webhook", express.raw({ type: "application/json" }), stripeWebhooks);

// Test endpoint to verify webhook is reachable
app.get("/api/stripe/webhook", (req, res) => {
    res.json({ message: "Webhook endpoint is reachable", timestamp: new Date() });
});

// Manual test endpoint for webhook logic
app.post("/api/stripe/test-webhook", express.json(), testWebhook); 
// Attach Clerk auth to populate req.auth on every request
app.use(clerkMiddleware());

// Webhook must receive raw body; accept any content-type
app.post("/api/clerk", express.raw({ type: "*/*" }), clerkWebhooks);

// Other routes (JSON parser for normal API)
app.use(express.json());
app.use("/api/user", userRoutes);
app.use("/api/hotels", hotelRouter);
app.use("/api/rooms", roomRoutes);
app.use("/api/bookings", bookingRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/admin", adminRoutes);

// Health check to verify env and connections (no secrets exposed)
app.get("/api/health", (req, res) => {
  const mongoState = mongoose.connection?.readyState;
  const isDbConnected = mongoState === 1; // 0=disconnected,1=connected,2=connecting,3=disconnecting
  res.json({
    ok: true,
    port: process.env.PORT || 3000,
    dbConnected: isDbConnected,
    env: {
      MONGO_URI: Boolean(process.env.MONGO_URI),
      CLERK_SECRET_KEY: Boolean(process.env.CLERK_SECRET_KEY),
      CLERK_PUBLISHABLE_KEY: Boolean(process.env.CLERK_PUBLISHABLE_KEY),
      CLOUDINARY_CLOUD_NAME: Boolean(process.env.CLOUDINARY_CLOUD_NAME),
      CLOUDINARY_API_KEY: Boolean(process.env.CLOUDINARY_API_KEY),
      CLOUDINARY_API_SECRET: Boolean(process.env.CLOUDINARY_API_SECRET),
      CLERK_WEBHOOK_SECRET: Boolean(process.env.CLERK_WEBHOOK_SECRET),
      STRIPE_SECRET_KEY: Boolean(process.env.STRIPE_SECRET_KEY),
      STRIPE_WEBHOOK_SECRET: Boolean(process.env.STRIPE_WEBHOOK_SECRET),
    },
  });
});

app.get("/", (req, res) => res.send("API is running"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


