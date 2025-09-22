const express = require('express');
const passport = require('passport');
const router = express.Router();
const Note = require('../models/Note');

// Middleware to authenticate and get user ID
const authMiddleware = passport.authenticate('jwt', { session: false });

// Create a note (user-specific)
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { note } = req.body;
        if (!note || !note.trim()) {
            return res.status(400).json({ message: "Note content is required" });
        }

        const newNote = new Note({
            note: note.trim(),
            userId: req.user._id
        });

        await newNote.save();
        res.status(201).json({ message: "Note saved!", note: newNote });
    } catch (err) {
        console.error("Error saving note:", err);
        res.status(500).json({ message: "Error saving note." });
    }
});

// Get all notes for current user
router.get('/', authMiddleware, async (req, res) => {
    try {
        const notes = await Note.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.json(notes);
    } catch (err) {
        console.error("Error fetching notes:", err);
        res.status(500).json({ message: "Error fetching notes." });
    }
});

// Delete a note (only if it belongs to current user)
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const note = await Note.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!note) {
            return res.status(404).json({ message: "Note not found or unauthorized" });
        }

        await Note.findByIdAndDelete(req.params.id);
        res.json({ message: "Note deleted successfully!" });
    } catch (err) {
        console.error("Error deleting note:", err);
        res.status(500).json({ message: "Error deleting note." });
    }
});

module.exports = router;