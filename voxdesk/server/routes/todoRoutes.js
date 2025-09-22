const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Todo = require("../models/Todo");

const router = express.Router();

// JWT Authentication Middleware (same as notes)
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'Access token required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id || decoded.userId || decoded._id || decoded.sub || decoded.user?.id;

        if (!userId) {
            return res.status(401).json({ message: 'Invalid token structure' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('JWT verification error:', error);
        return res.status(403).json({ message: 'Invalid or expired token' });
    }
};

// Create todo (user-specific)
router.post("/", authenticateToken, async (req, res) => {
    try {
        const { title } = req.body;
        if (!title || !title.trim()) {
            return res.status(400).json({ message: "Todo title is required" });
        }

        const todo = new Todo({
            title: title.trim(),
            userId: req.user._id
        });

        await todo.save();
        console.log("Todo created for user:", req.user.email);
        res.json(todo);
    } catch (err) {
        console.error("Error creating todo:", err);
        res.status(500).json({ message: "Error creating todo" });
    }
});

// Get todos for current user only
router.get("/", authenticateToken, async (req, res) => {
    try {
        const todos = await Todo.find({ userId: req.user._id }).sort({ createdAt: -1 });
        console.log(`Found ${todos.length} todos for user ${req.user.email}`);
        res.json(todos);
    } catch (err) {
        console.error("Error fetching todos:", err);
        res.status(500).json({ message: "Error fetching todos" });
    }
});

// Update todo (only if it belongs to current user)
router.put("/:id", authenticateToken, async (req, res) => {
    try {
        const todo = await Todo.findOne({ _id: req.params.id, userId: req.user._id });
        if (!todo) {
            return res.status(404).json({ message: "Todo not found or unauthorized" });
        }

        todo.completed = req.body.completed ?? todo.completed;
        todo.title = req.body.title ?? todo.title;
        await todo.save();

        console.log("Todo updated for user:", req.user.email);
        res.json(todo);
    } catch (err) {
        console.error("Error updating todo:", err);
        res.status(500).json({ message: "Error updating todo" });
    }
});

// Delete todo (only if it belongs to current user)
router.delete("/:id", authenticateToken, async (req, res) => {
    try {
        const todo = await Todo.findOne({ _id: req.params.id, userId: req.user._id });
        if (!todo) {
            return res.status(404).json({ message: "Todo not found or unauthorized" });
        }

        await Todo.findByIdAndDelete(req.params.id);
        console.log("Todo deleted for user:", req.user.email);
        res.json({ message: "Todo deleted" });
    } catch (err) {
        console.error("Error deleting todo:", err);
        res.status(500).json({ message: "Error deleting todo" });
    }
});

module.exports = router;