const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    passwordHash: { type: String }, // for local users
    googleId: { type: String },     // for Google users
    name: { type: String },
    avatar: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);