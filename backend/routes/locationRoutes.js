import express from "express";
import Location from "../models/Location.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

/* ------------------------------------------------
   📍 Save Location (Optional REST fallback)
--------------------------------------------------*/
router.post("/update", async (req, res) => {
  try {
    const { userId, latitude, longitude } = req.body;

    if (!userId || !latitude || !longitude) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const location = await Location.create({
      userId,
      latitude,
      longitude,
    });

    res.json(location);
  } catch (error) {
    res.status(500).json({ message: "Error saving location" });
  }
});

/* ------------------------------------------------
   📊 Get All Locations of User (Admin Only)
--------------------------------------------------*/
router.get("/user/:id", authMiddleware, async (req, res) => {
  try {
    const locations = await Location.find({
      userId: req.params.id,
    }).sort({ timestamp: 1 });

    res.json(locations);
  } catch (error) {
    res.status(500).json({ message: "Error fetching locations" });
  }
});

/* ------------------------------------------------
   📈 Get Latest Location (Admin Only)
--------------------------------------------------*/
router.get("/latest/:id", authMiddleware, async (req, res) => {
  try {
    const location = await Location.findOne({
      userId: req.params.id,
    }).sort({ timestamp: -1 });

    if (!location)
      return res.status(404).json({ message: "No location found" });

    res.json(location);
  } catch (error) {
    res.status(500).json({ message: "Error fetching latest location" });
  }
});

export default router;
