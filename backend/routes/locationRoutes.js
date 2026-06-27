import express from "express";
import Location from "../models/Location.js";
import { verifyToken, adminMiddleware } from "../middleware/adminMiddleware.js";

const router = express.Router();
const requireAdmin = [verifyToken, adminMiddleware];

router.get("/user/:id", requireAdmin, async (req, res) => {
  try {
    const locations = await Location.find({ userId: req.params.id }).sort({
      timestamp: 1,
    });

    res.json(locations);
  } catch (error) {
    res.status(500).json({ message: "Error fetching locations" });
  }
});

router.get("/latest/:id", requireAdmin, async (req, res) => {
  try {
    const location = await Location.findOne({ userId: req.params.id }).sort({
      timestamp: -1,
    });

    if (!location) {
      return res.status(404).json({ message: "No location found" });
    }

    res.json(location);
  } catch (error) {
    res.status(500).json({ message: "Error fetching latest location" });
  }
});

export default router;
