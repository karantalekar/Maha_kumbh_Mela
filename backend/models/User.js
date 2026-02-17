import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  aadhaar: String, // encrypted
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },

  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("User", userSchema);
