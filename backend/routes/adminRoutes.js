import express from "express";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import User from "../models/User.js";
import Location from "../models/Location.js";
import { decrypt } from "../encryption.js";
import { verifyToken, adminMiddleware } from "../middleware/adminMiddleware.js";
import config from "../config.js";

const router = express.Router();

const normalizeEmail = (email) => email?.trim().toLowerCase();
const isEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || "");
const sanitizeAdmin = (admin) => ({
  id: admin._id,
  username: admin.username,
  email: admin.email,
  role: admin.role,
});

const requireAdmin = [verifyToken, adminMiddleware];

router.post("/register-admin", async (req, res) => {
  try {
    const username = req.body.username?.trim();
    const email = normalizeEmail(req.body.email);
    const { password, secret } = req.body;

    if (secret !== config.adminSecret) {
      return res.status(403).json({ message: "Not allowed" });
    }

    if (!username || !isEmail(email) || !password || password.length < 8) {
      return res.status(400).json({
        message: "Username, valid email, and password of 8+ characters are required",
      });
    }

    const existing = await Admin.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "Admin already exists" });
    }

    const admin = await Admin.create({
      username,
      email,
      password,
      role: "admin",
    });

    res.status(201).json({
      message: "Admin created successfully",
      admin: admin.toJSON(),
    });
  } catch (error) {
    console.error("Admin registration failed:", error);
    res.status(500).json({ message: "Error creating admin" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const { password } = req.body;

    if (!isEmail(email) || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const admin = await Admin.findOne({ email }).select("+password");
    if (!admin) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      config.jwtSecret,
      { expiresIn: "7d" },
    );

    res.json({
      message: "Login successful",
      token,
      admin: sanitizeAdmin(admin),
    });
  } catch (error) {
    console.error("Admin login failed:", error);
    res.status(500).json({ message: "Login error" });
  }
});

router.get("/profile", requireAdmin, async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    res.json(sanitizeAdmin(admin));
  } catch (error) {
    res.status(500).json({ message: "Error fetching profile" });
  }
});

router.put("/profile", requireAdmin, async (req, res) => {
  try {
    const username = req.body.username?.trim();
    const email = normalizeEmail(req.body.email);

    if (!username || !isEmail(email)) {
      return res.status(400).json({ message: "Valid username and email are required" });
    }

    const duplicate = await Admin.findOne({
      email,
      _id: { $ne: req.user.id },
    });
    if (duplicate) {
      return res.status(409).json({ message: "Email is already in use" });
    }

    const admin = await Admin.findByIdAndUpdate(
      req.user.id,
      { username, email },
      { new: true, runValidators: true },
    );
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    res.json(sanitizeAdmin(admin));
  } catch (error) {
    res.status(500).json({ message: "Error updating profile" });
  }
});

router.put("/change-password", requireAdmin, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword || newPassword.length < 8) {
      return res.status(400).json({
        message: "Old password and new password of 8+ characters are required",
      });
    }

    const admin = await Admin.findById(req.user.id).select("+password");
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const isMatch = await admin.comparePassword(oldPassword);
    if (!isMatch) {
      return res.status(400).json({ message: "Old password is incorrect" });
    }

    admin.password = newPassword;
    await admin.save();

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error changing password" });
  }
});

router.get("/users", requireAdmin, async (_req, res) => {
  try {
    const users = await User.find({ role: "user" })
      .select("-aadhaar")
      .sort({ createdAt: -1 })
      .lean();

    const usersWithLocations = await Promise.all(
      users.map(async (user) => {
        const latestLocation = await Location.findOne({ userId: user._id })
          .sort({ timestamp: -1 })
          .lean();

        return { ...user, latestLocation };
      }),
    );

    res.json(usersWithLocations);
  } catch (err) {
    res.status(500).json({ message: "Error fetching users" });
  }
});

router.get("/user/:id", requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).lean();
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      ...user,
      aadhaar: decrypt(user.aadhaar),
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching user" });
  }
});

router.get("/locations/:id", requireAdmin, async (req, res) => {
  try {
    const locations = await Location.find({ userId: req.params.id }).sort({
      timestamp: 1,
    });

    res.json(locations);
  } catch (err) {
    res.status(500).json({ message: "Error fetching locations" });
  }
});

export default router;
