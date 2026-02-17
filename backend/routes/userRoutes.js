import express from "express";
import User from "../models/User.js";
import { encrypt } from "../encryption.js";

const router = express.Router();
router.post("/register", async (req, res) => {
  const { username, email, aadhaar } = req.body;

  const user = await User.create({
    username,
    email,
    aadhaar: encrypt(aadhaar),
  });

  res.json(user);
});

export default router;
