// server/routes/taskRoutes.js
const express = require("express");
const Task = require("../models/Task");

const router = express.Router();

// ✅ Create task
router.post("/", (req, res) => req.authMiddleware(req, res, async () => {
    try {
        const { title, description } = req.body;
        const task = new Task({ title, description, userId: req.userId });
        await task.save();
        res.json(task);
    } catch (err) {
        res.status(500).json({ message: "Error creating task" });
    }
}));

// ✅ Get tasks
router.get("/", (req, res) => req.authMiddleware(req, res, async () => {
    try {
        const tasks = await Task.find({ userId: req.userId }).sort({ createdAt: -1 });
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ message: "Error fetching tasks" });
    }
}));

// ✅ Update task
router.put("/:id", (req, res) => req.authMiddleware(req, res, async () => {
    try {
        const task = await Task.findOne({ _id: req.params.id, userId: req.userId });
        if (!task) return res.status(404).json({ message: "Task not found" });

        task.title = req.body.title ?? task.title;
        task.description = req.body.description ?? task.description;
        task.completed = req.body.completed ?? task.completed;
        await task.save();

        res.json(task);
    } catch (err) {
        res.status(500).json({ message: "Error updating task" });
    }
}));

// ✅ Delete task
router.delete("/:id", (req, res) => req.authMiddleware(req, res, async () => {
    try {
        await Task.findOneAndDelete({ _id: req.params.id, userId: req.userId });
        res.json({ message: "Task deleted" });
    } catch (err) {
        res.status(500).json({ message: "Error deleting task" });
    }
}));

module.exports = router;
