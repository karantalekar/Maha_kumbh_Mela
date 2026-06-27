import mongoose from "mongoose";

const locationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  latitude: { type: Number, required: true, min: -90, max: 90 },
  longitude: { type: Number, required: true, min: -180, max: 180 },
  speed: { type: Number, default: 0 },
  distance: { type: Number, default: 0 },
  timestamp: { type: Date, default: Date.now },
});

locationSchema.index({ userId: 1, timestamp: -1 });

export default mongoose.model("Location", locationSchema);
