// server/routes/todoRoutes.js
const express = require("express");
const Todo = require("../models/Todo");

const router = express.Router();

// ✅ Create todo
router.post("/", (req, res) => req.authMiddleware(req, res, async () => {
    try {
        const { title } = req.body;
        const todo = new Todo({ title, userId: req.userId });
        await todo.save();
        res.json(todo);
    } catch (err) {
        res.status(500).json({ message: "Error creating todo" });
    }
}));

// ✅ Get todos
router.get("/", (req, res) => req.authMiddleware(req, res, async () => {
    try {
        const todos = await Todo.find({ userId: req.userId }).sort({ createdAt: -1 });
        res.json(todos);
    } catch (err) {
        res.status(500).json({ message: "Error fetching todos" });
    }
}));

// ✅ Update todo
router.put("/:id", (req, res) => req.authMiddleware(req, res, async () => {
    try {
        const todo = await Todo.findOne({ _id: req.params.id, userId: req.userId });
        if (!todo) return res.status(404).json({ message: "Todo not found" });

        todo.completed = req.body.completed ?? todo.completed;
        await todo.save();
        res.json(todo);
    } catch (err) {
        res.status(500).json({ message: "Error updating todo" });
    }
}));

// ✅ Delete todo
router.delete("/:id", (req, res) => req.authMiddleware(req, res, async () => {
    try {
        await Todo.findOneAndDelete({ _id: req.params.id, userId: req.userId });
        res.json({ message: "Todo deleted" });
    } catch (err) {
        res.status(500).json({ message: "Error deleting todo" });
    }
}));

module.exports = router;
