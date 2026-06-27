import express from "express";
import User from "../models/User.js";
import { encrypt } from "../encryption.js";

const router = express.Router();

const normalizeEmail = (email) => email?.trim().toLowerCase();
const isEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || "");

router.post("/register", async (req, res) => {
  try {
    const username = req.body.username?.trim();
    const email = normalizeEmail(req.body.email);
    const aadhaar = String(req.body.aadhaar || "").replace(/\D/g, "");

    if (!username || !isEmail(email) || aadhaar.length !== 12) {
      return res.status(400).json({
        message: "Name, valid email, and 12 digit Aadhaar are required",
      });
    }

    const user = await User.create({
      username,
      email,
      aadhaar: encrypt(aadhaar),
      role: "user",
    });

    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error("User registration failed:", error);
    res.status(500).json({ message: "Registration failed" });
  }
});

export default router;
