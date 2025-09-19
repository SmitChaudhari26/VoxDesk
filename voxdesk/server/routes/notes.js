const express = require('express');
const router = express.Router();
const Note = require('../models/Note');

app.post("/api/notes", authMiddleware, async (req, res) => {
    const { note } = req.body;
    const newNote = new Note({ note, userId: req.userId });
    await newNote.save();
    res.status(201).json(newNote);
});

app.get("/api/notes", authMiddleware, async (req, res) => {
    const notes = await Note.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(notes);
});

// Delete a note
router.delete('/api/notes/:id', async (req, res) => {
    try {
        await Note.findByIdAndDelete(req.params.id);
        res.json({ message: 'Note deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;