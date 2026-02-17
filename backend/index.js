import express from "express";
import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";

import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import socketHandler from "./socket.js";

const app = express();
const server = http.createServer(app);

// ✅ Socket.IO Setup
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

socketHandler(io);

// ✅ Middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);

app.use(express.json());

// ✅ Routes
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);

// ✅ MongoDB Connection
mongoose
  .connect("mongodb://localhost:27017/tracker")
  .then(() => {
    console.log("MongoDB Connected");

    server.listen(3000, () => {
      console.log("Backend running on port 3000");
    });
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
  });
