// import express from "express";
// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";
// import User from "../models/User.js";
// import Location from "../models/Location.js";
// import { decrypt } from "../encryption.js";
// import authMiddleware from "../middleware/authMiddleware.js";
// import adminMiddleware from "../middleware/adminMiddleware.js";

// const router = express.Router();

// /* =========================================
//    🔐 ADMIN REGISTER (Hardcoded Secret)
// ========================================= */
// router.post("/register-admin", async (req, res) => {
//   try {
//     const { username, email, password, secret } = req.body;

//     // 🔒 Hardcoded Secret
//     if (secret !== "createAdmin123") {
//       return res.status(403).json({ message: "Not allowed" });
//     }

//     const existing = await User.findOne({ email });
//     if (existing) {
//       return res.status(400).json({ message: "Admin already exists" });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const admin = await User.create({
//       username,
//       email,
//       password: hashedPassword,
//       role: "admin",
//     });

//     res.status(201).json({
//       message: "Admin created successfully",
//       admin,
//     });
//   } catch (error) {
//     res.status(500).json({ message: "Error creating admin" });
//   }
// });

// /* =========================================
//    🔐 ADMIN LOGIN
// ========================================= */
// router.post("/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     const admin = await User.findOne({ email });
//     if (!admin) {
//       return res.status(400).json({ message: "Admin not found" });
//     }

//     if (admin.role !== "admin") {
//       return res.status(403).json({ message: "Not authorized" });
//     }

//     const isMatch = await bcrypt.compare(password, admin.password);
//     if (!isMatch) {
//       return res.status(400).json({ message: "Invalid credentials" });
//     }

//     // 🔐 Hardcoded JWT Secret
//     const token = jwt.sign({ id: admin._id }, "mySuperSecretKey", {
//       expiresIn: "1d",
//     });

//     res.json({
//       message: "Login successful",
//       token,
//     });
//   } catch (error) {
//     res.status(500).json({ message: "Login error" });
//   }
// });

// /* =========================================
//    👥 Get All Users (Admin Only)
// ========================================= */
// router.get("/users", authMiddleware, adminMiddleware, async (req, res) => {
//   try {
//     const users = await User.find().select("-aadhaar -password");
//     res.json(users);
//   } catch (err) {
//     res.status(500).json({ message: "Error fetching users" });
//   }
// });

// /* =========================================
//    👤 Get Single User (Decrypt Aadhaar)
// ========================================= */
// router.get("/user/:id", authMiddleware, adminMiddleware, async (req, res) => {
//   try {
//     const user = await User.findById(req.params.id);

//     if (!user) return res.status(404).json({ message: "User not found" });

//     const decryptedUser = {
//       ...user.toObject(),
//       aadhaar: decrypt(user.aadhaar),
//     };

//     res.json(decryptedUser);
//   } catch (err) {
//     res.status(500).json({ message: "Error fetching user" });
//   }
// });

// /* =========================================
//    📍 Get User Locations
// ========================================= */
// router.get(
//   "/locations/:id",
//   authMiddleware,
//   adminMiddleware,
//   async (req, res) => {
//     try {
//       const locations = await Location.find({
//         userId: req.params.id,
//       }).sort({ timestamp: 1 });

//       res.json(locations);
//     } catch (err) {
//       res.status(500).json({ message: "Error fetching locations" });
//     }
//   },
// );

// export default router;

import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import User from "../models/User.js";
import Location from "../models/Location.js";
import { decrypt } from "../encryption.js";
import { verifyToken, adminMiddleware } from "../middleware/adminMiddleware.js";

const router = express.Router();

const JWT_SECRET = "mySuperSecretKey"; // keep secret consistent

/* =========================================
   🔐 ADMIN REGISTER (Hardcoded Secret)
========================================= */
router.post("/register-admin", async (req, res) => {
  try {
    const { username, email, password, secret } = req.body;

    // Only allow admin creation with secret
    if (secret !== "Admin123") {
      return res.status(403).json({ message: "Not allowed" });
    }

    const existing = await Admin.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await Admin.create({
      username,
      email,
      password: hashedPassword,
      role: "admin", // ensure role is admin
    });

    res.status(201).json({ message: "Admin created successfully", admin });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating admin" });
  }
});

/* =========================================
   🔐 ADMIN LOGIN
========================================= */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(400).json({ message: "Admin not found" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: admin._id, role: "admin" }, JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({
      message: "Login successful",
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Login error" });
  }
});

/* =========================================
   👥 Get All Users (Admin Only)
========================================= */
router.get("/users", verifyToken, adminMiddleware, async (req, res) => {
  try {
    const users = await User.find().select("-aadhaar -password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Error fetching users" });
  }
});

/* =========================================
   👤 Get Single User (Decrypt Aadhaar)
========================================= */
router.get("/user/:id", verifyToken, adminMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const decryptedUser = {
      ...user.toObject(),
      aadhaar: decrypt(user.aadhaar),
    };

    res.json(decryptedUser);
  } catch (err) {
    res.status(500).json({ message: "Error fetching user" });
  }
});

/* =========================================
   📍 Get User Locations
========================================= */
router.get("/locations/:id", verifyToken, adminMiddleware, async (req, res) => {
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
