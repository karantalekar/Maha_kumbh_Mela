import mongoose from "mongoose";

const locationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  latitude: Number,
  longitude: Number,
  speed: Number,
  distance: Number,
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.model("Location", locationSchema);
