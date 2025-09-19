const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

const signToken = (user) =>
    jwt.sign(
        { sub: user._id, email: user.email, name: user.name, avatar: user.avatar },
        JWT_SECRET,
        { expiresIn: "7d" }
    );

// Register (use once to create a local user)
router.post("/register", async (req, res) => {
    try {
        const { email, password, name } = req.body;
        if (!email || !password) return res.status(400).json({ message: "Email and password required" });
        const exists = await User.findOne({ email });
        if (exists) return res.status(409).json({ message: "Email already in use" });
        const passwordHash = await bcrypt.hash(password, 10);
        const user = await User.create({ email, passwordHash, name: name || email.split("@")[0] });
        const token = signToken(user);
        res.json({ token, user: { email: user.email, name: user.name, avatar: user.avatar } });
    } catch (e) {
        res.status(500).json({ message: "Failed to register" });
    }
});

// Local login
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || !user.passwordHash) return res.status(401).json({ message: "Invalid credentials" });
        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return res.status(401).json({ message: "Invalid credentials" });
        const token = signToken(user);
        res.json({ token, user: { email: user.email, name: user.name, avatar: user.avatar } });
    } catch {
        res.status(500).json({ message: "Login failed" });
    }
});

// Google sign-in (accepts Google ID Token from frontend)
router.post("/google", async (req, res) => {
    try {
        const { idToken } = req.body;
        if (!idToken) return res.status(400).json({ message: "idToken required" });
        const ticket = await googleClient.verifyIdToken({
            idToken,
            audience: GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload(); // email, sub, name, picture
        let user = await User.findOne({ email: payload.email });
        if (!user) {
            user = await User.create({
                email: payload.email,
                googleId: payload.sub,
                name: payload.name,
                avatar: payload.picture,
            });
        } else if (!user.googleId) {
            user.googleId = payload.sub;
            user.name = user.name || payload.name;
            user.avatar = user.avatar || payload.picture;
            await user.save();
        }
        const token = signToken(user);
        res.json({ token, user: { email: user.email, name: user.name, avatar: user.avatar } });
    } catch (e) {
        res.status(401).json({ message: "Google sign-in failed" });
    }
});

module.exports = router;