const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const authRoutes = require("./routes/auth");

const app = express();
app.use(cors());
app.use(express.json());

// Mount auth routes
app.use("/api/auth", authRoutes);

// --- Notes Model ---
const noteSchema = new mongoose.Schema({
  note: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});
const Note = mongoose.model("Note", noteSchema);

// --- Notes Route ---
app.post("/api/notes", async (req, res) => {
  try {
    const { note } = req.body;
    const newNote = new Note({ note });
    await newNote.save();
    res.status(201).json({ message: "Note saved!" });
  } catch (err) {
    res.status(500).json({ message: "Error saving note." });
  }
});

// --- MongoDB Connection ---
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB connected");
    app.listen(5000, () => console.log("Server running on port 5000"));
  })
  .catch((err) => console.log(err));