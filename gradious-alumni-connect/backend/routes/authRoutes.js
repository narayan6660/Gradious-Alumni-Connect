// ==============================
// 🔐 AUTH ROUTES
// ==============================

const express = require("express");
const router = express.Router();

const {register, login, forgotPassword, resetPassword} = require("../controllers/authController");
// 📝 Register Route
router.post("/register", register);

// 🔑 Login Route
router.post("/login", login);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;
