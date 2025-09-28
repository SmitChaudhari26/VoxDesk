const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const path = require("path");

dotenv.config();

// Import User model - ADD THIS LINE
const User = require('./models/User');

// Auth routes can export either { router, authMiddleware } or a router directly
const authModule = require("./routes/auth");
const authRoutes = authModule.router || authModule;
const authMiddleware = authModule.authMiddleware || ((req, _res, next) => next());

const todoRoutes = require("./routes/todoRoutes");
const profileRoutes = require("./routes/profile");

const app = express();

// Middlewares
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());

// Simple JWT Authentication Middleware - UPDATED VERSION
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    console.log('\n=== JWT DEBUG ===');
    console.log('1. Auth header received:', authHeader);
    console.log('2. Extracted token:', token ? 'Token exists' : 'No token');

    if (!token) {
      console.log('3. ERROR: No token provided');
      return res.status(401).json({ message: 'Access token required' });
    }

    // Verify the token
    console.log('3. JWT_SECRET exists:', !!process.env.JWT_SECRET);
    console.log('4. Attempting to verify token...');

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('5. Token decoded successfully:', decoded);

    // Try different possible user ID fields INCLUDING 'sub'
    const userId = decoded.id || decoded.userId || decoded._id || decoded.sub || decoded.user?.id;
    console.log('6. Looking for user with ID:', userId);

    if (!userId) {
      console.log('7. ERROR: No user ID found in token');
      return res.status(401).json({ message: 'Invalid token structure' });
    }

    // Find user by ID
    const user = await User.findById(userId);
    console.log('8. User lookup result:', user ? `Found user: ${user.email}` : 'User not found');

    if (!user) {
      console.log('9. ERROR: User not found in database');
      return res.status(401).json({ message: 'User not found' });
    }

    console.log('10. SUCCESS: User authenticated');
    console.log('=== END DEBUG ===\n');

    req.user = user;
    next();
  } catch (error) {
    console.log('\n=== JWT ERROR ===');
    console.log('JWT verification failed:', error.message);
    console.log('Error type:', error.name);
    console.log('=== END ERROR ===\n');

    return res.status(403).json({
      message: 'Invalid or expired token',
      error: error.message
    });
  }
};

// ---------- USER-SPECIFIC Notes Routes ----------
// Updated note schema to include userId
const noteSchema = new mongoose.Schema({
  note: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
});
const Note = mongoose.models.Note || mongoose.model("Note", noteSchema);

// Create note (user-specific)
app.post("/api/notes", authenticateToken, async (req, res) => {
  try {
    const { note } = req.body;
    console.log('Creating note for user:', req.user.email);
    console.log('Note content:', note);

    if (!note || !note.trim()) {
      return res.status(400).json({ message: "Note content is required" });
    }

    const newNote = new Note({
      note: note.trim(),
      userId: req.user._id
    });

    const savedNote = await newNote.save();
    console.log("Note saved successfully:", savedNote);
    res.status(201).json({ message: "Note saved!", note: savedNote });
  } catch (err) {
    console.error("Error saving note:", err);
    res.status(500).json({ message: "Error saving note.", error: err.message });
  }
});

// Get notes for current user only
app.get("/api/notes", authenticateToken, async (req, res) => {
  try {
    console.log('Fetching notes for user:', req.user.email);
    const notes = await Note.find({ userId: req.user._id }).sort({ createdAt: -1 });
    console.log(`Found ${notes.length} notes for user ${req.user._id}`);
    res.json(notes);
  } catch (err) {
    console.error("Error fetching notes:", err);
    res.status(500).json({ message: "Error fetching notes.", error: err.message });
  }
});

// Delete note (only if it belongs to current user)
app.delete("/api/notes/:id", authenticateToken, async (req, res) => {
  try {
    console.log('Deleting note:', req.params.id, 'for user:', req.user.email);
    const note = await Note.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!note) {
      return res.status(404).json({ message: "Note not found or unauthorized" });
    }

    await Note.findByIdAndDelete(req.params.id);
    console.log("Note deleted successfully:", req.params.id);
    res.json({ message: "Note deleted successfully!" });
  } catch (err) {
    console.error("Error deleting note:", err);
    res.status(500).json({ message: "Error deleting note.", error: err.message });
  }
});

// --------------------------------------------------------------------

// Static serving for future media uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/todos", todoRoutes);
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




// ---------- Profile Routes ----------
const multer = require('multer');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/avatars/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, req.user._id + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Create uploads directory if it doesn't exist
const fs = require('fs');
if (!fs.existsSync('uploads/avatars/')) {
  fs.mkdirSync('uploads/avatars/', { recursive: true });
}

// Update profile information
app.put('/api/profile/update', authenticateToken, async (req, res) => {
  try {
    const { name, email, currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    // Update basic info
    if (name) user.name = name;
    if (email) user.email = email;

    // Handle password change (only for local accounts)
    if (newPassword && !user.googleId) {
      if (!currentPassword) {
        return res.status(400).json({ message: 'Current password is required' });
      }

      const bcrypt = require('bcrypt');
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }

      user.password = await bcrypt.hash(newPassword, 10);
    }

    await user.save();
    console.log('Profile updated for user:', user.email);

    res.json({
      message: 'Profile updated successfully',
      user: {
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        googleId: user.googleId
      }
    });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ message: 'Error updating profile' });
  }
});

// Upload profile picture
app.post('/api/profile/avatar', authenticateToken, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const avatarUrl = `http://localhost:5000/uploads/avatars/${req.file.filename}`;

    // Update user's avatar URL in database
    await User.findByIdAndUpdate(req.user._id, { avatar: avatarUrl });

    console.log('Avatar updated for user:', req.user.email);
    res.json({
      message: 'Avatar updated successfully',
      avatarUrl: avatarUrl
    });
  } catch (err) {
    console.error('Error uploading avatar:', err);
    res.status(500).json({ message: 'Error uploading avatar' });
  }
});