const mongoose = require("mongoose");

const TodoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Add user association
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Todo", TodoSchema);