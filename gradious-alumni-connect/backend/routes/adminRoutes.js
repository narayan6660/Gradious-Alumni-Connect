/* =========================================
   ADMIN ROUTES
   File: routes/adminRoutes.js
   Purpose: Handles admin dashboard statistics
========================================= */

const express = require("express");
const router = express.Router();
const db = require("../config/db");

const {verifyToken} = require("../middleware/authMiddleware");
const {checkRole} = require("../middleware/roleMiddleware");
const {markAdminNotificationsRead} = require("../controllers/userController");
/* =========================================
   GET ADMIN DASHBOARD STATS
   Endpoint: GET /api/admin/stats
========================================= */

router.get("/stats", verifyToken, checkRole("admin"), async (req, res) => {
    try {
        const [users] = await db.query("SELECT COUNT(*) as total FROM users WHERE is_deleted = 0");

        const [admins] = await db.query("SELECT COUNT(*) as total FROM users WHERE role = 'admin' AND is_deleted = 0");

        const [alumni] = await db.query("SELECT COUNT(*) as total FROM users WHERE role = 'alumni' AND is_deleted = 0");

        const [deleted] = await db.query("SELECT COUNT(*) as total FROM users WHERE is_deleted = 1");

        res.json({
            totalUsers: users[0].total,
            totalAdmins: admins[0].total,
            totalAlumni: alumni[0].total,
            totalDeleted: deleted[0].total,
        });
    } catch (error) {
        console.error("Admin Stats Error:", error);

        res.status(500).json({
            message: "Server Error",
        });
    }
});
router.put("/notifications/read", markAdminNotificationsRead);

module.exports = router;
