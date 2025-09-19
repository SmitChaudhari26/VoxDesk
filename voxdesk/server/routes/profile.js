const express = require("express");
const passport = require("passport");

const router = express.Router();

// GET /api/profile - return current user profile
router.get(
    "/",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
        const user = req.user || {};
        res.json({
            email: user.email,
            name: user.name,
            avatar: user.avatar,
            id: user._id,
        });
    }
);

module.exports = router;