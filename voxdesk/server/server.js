const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const passport = require("passport");
const path = require("path");

dotenv.config();
require("./config/passport");

// Auth routes can export either { router, authMiddleware } or a router directly
const authModule = require("./routes/auth");
const authRoutes = authModule.router || authModule;
const authMiddleware = authModule.authMiddleware || ((req, _res, next) => next());

const todoRoutes = require("./routes/todoRoutes");
const taskRoutes = require("./routes/taskRoutes");
const profileRoutes = require("./routes/profile");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(passport.initialize());

// Make authMiddleware available on req (if provided by your auth module)
app.use((req, _res, next) => {
  req.authMiddleware = authMiddleware;
  next();
});

// ---------- Inline Notes model + routes (kept as requested) ----------
// Use guard to avoid OverwriteModelError if model is defined elsewhere or on hot reload
const noteSchema = new mongoose.Schema({
  note: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});
const Note = mongoose.models.Note || mongoose.model("Note", noteSchema);

// Create note
app.post("/api/notes", async (req, res) => {
  try {
    const { note } = req.body;
    if (!note || !note.trim()) return res.status(400).json({ message: "Note is required" });
    const newNote = new Note({ note: note.trim() });
    await newNote.save();
    res.status(201).json({ message: "Note saved!", note: newNote });
  } catch (err) {
    console.error("Error saving note:", err);
    res.status(500).json({ message: "Error saving note." });
  }
});

// Get all notes
app.get("/api/notes", async (_req, res) => {
  try {
    const notes = await Note.find().sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) {
    console.error("Error fetching notes:", err);
    res.status(500).json({ message: "Error fetching notes." });
  }
});

// Delete note
app.delete("/api/notes/:id", async (req, res) => {
  try {
    await Note.findByIdAndDelete(req.params.id);
    res.json({ message: "Note deleted successfully!" });
  } catch (err) {
    console.error("Error deleting note:", err);
    res.status(500).json({ message: "Error deleting note." });
  }
});
// --------------------------------------------------------------------

// Static serving for future media uploads (optional, helps later)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/todos", todoRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/profile", profileRoutes);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, env: process.env.NODE_ENV || "development", time: new Date().toISOString() });
});

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(5000, () => console.log("🚀 Server running on port 5000"));
  })
  .catch((err) => console.error("MongoDB connection error:", err));

// Error handler
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// ...existing code...
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
// ...existing code for notes, routes, uploads, health, mongo, error handler...

// REMOVE everything you added after the error handler:
// - getOAuthClient()
// - router.post("/google", ...)
// Those belong in routes/auth.js, not here.
