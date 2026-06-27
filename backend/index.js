import express from "express";
import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";

import config from "./config.js";
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import socketHandler from "./socket.js";

const app = express();
const server = http.createServer(app);

const corsOptions = {
  origin(origin, callback) {
    if (!origin || config.clientUrls.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};

const io = new Server(server, {
  cors: corsOptions,
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(
      `Port ${config.port} is already in use. Stop the existing server or run with PORT=3001.`,
    );
    process.exit(1);
  }

  console.error("Server failed to start:", error);
  process.exit(1);
});

socketHandler(io);

app.use(cors(corsOptions));
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);

app.use((err, _req, res, _next) => {
  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({ message: "Origin not allowed" });
  }

  console.error("Unhandled error:", err);
  return res.status(500).json({ message: "Internal server error" });
});

mongoose
  .connect(config.mongoUri)
  .then(() => {
    console.log("MongoDB connected");

    server.listen(config.port, () => {
      console.log(`Backend running on port ${config.port}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  });
