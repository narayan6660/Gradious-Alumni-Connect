        const express = require("express");
        const router = express.Router();

        const {verifyToken} = require("../middleware/authMiddleware");
        const {checkRole} = require("../middleware/roleMiddleware");
        const upload = require("../middleware/upload");

        const {
            getAllUsers,
            updateProfile,
            deleteUser,
            restoreUser,
            getDeletedUsers,
            permanentDeleteUser,
            getDashboardStats,
            getUsersWithPagination,
            changePassword,
            exportUsers,
            getMonthlyGrowth,
        
            getProfile,
            getMessages,
            sendMessage,
            getUserById,
            getNotifications,
            getPlatformStats,
           getUserProfile ,
            getAlumniDashboard,
            sendNetworkRequest,
            acceptNetworkRequest,
            rejectNetworkRequest,
            getNetworkRequests,
            getMyNetwork,
            sendFileMessage,
            getNetworkUsers,
            getFeaturedAlumni,
            getAdminStats,
            getAdminActivity,
            getAdminNotifications,
            getRecentUsers,
            markNotificationsAsRead,
            adminUpdateUser,
            getMessageUsers,
            cancelNetworkRequest,
            getMutualConnections,
            getAlumniAnalytics,
            getAlumniActivity,
            markMessagesAsRead,
        } = require("../controllers/userController");

        // =============================================
        // 🔒 GENERAL PROTECTED ROUTES
        // =============================================

        router.get("/profile", verifyToken, getProfile);
        router.put("/update-profile", verifyToken, updateProfile);
        router.put("/change-password", verifyToken, changePassword);

        // =============================================
        // 👑 ADMIN ROUTES
        // =============================================

        router.get("/admin-dashboard", verifyToken, checkRole("admin"), (req, res) => {
            res.json({message: "Welcome Admin 👑"});
        });

        router.get("/all-users", verifyToken, checkRole("admin"), getAllUsers);
        router.get("/", verifyToken, checkRole("admin"), getUsersWithPagination);
        router.get("/dashboard-stats", verifyToken, checkRole("admin"), getDashboardStats);
        router.get("/trash", verifyToken, checkRole("admin"), getDeletedUsers);
        router.delete("/delete/:id", verifyToken, checkRole("admin"), deleteUser);
        router.put("/restore/:id", verifyToken, checkRole("admin"), restoreUser);
        router.delete("/permanent-delete/:id", verifyToken, checkRole("admin"), permanentDeleteUser);
        router.get("/export", verifyToken, checkRole("admin"), exportUsers);
        router.get("/monthly-growth", verifyToken, checkRole("admin"), getMonthlyGrowth);



        // =============================================
        // 🧑‍💼 ALUMNI ROUTES
        // =============================================

        router.get("/alumni/dashboard", verifyToken, checkRole("alumni"), getAlumniDashboard);
    router.get("/alumni/analytics", verifyToken, checkRole("alumni"), getAlumniAnalytics);
    router.get("/alumni/activity", verifyToken, checkRole("alumni"), getAlumniActivity);

        // =============================================
        // 💬 MESSAGING ROUTES
        // =============================================

        router.get("/messages/users", verifyToken, getMessageUsers);
        router.get("/messages/:userId", verifyToken, getMessages);
        router.post("/messages/send", verifyToken, upload.single("file"), sendMessage);
        router.post("/messages/upload", verifyToken, upload.single("file"), sendFileMessage);
    router.put("/messages/mark-read", verifyToken, markMessagesAsRead);

        // =============================================
        // 👤 USER INFO
        // =============================================

    router.get("/profile/:id", verifyToken, getUserProfile);

        // =============================================
        // 🔔 NOTIFICATIONS
        // =============================================

        router.get("/notifications", verifyToken, getNotifications);

        // =============================================
        // 🌐 PUBLIC PLATFORM STATS
        // =============================================

        router.get("/platform-stats", getPlatformStats);

        // =============================================
        // 🌐 NETWORK CONNECTIONS (🔥 ONLY SYSTEM NOW)
        // =============================================

        router.post("/network/connect", verifyToken, sendNetworkRequest);
        router.put("/network/accept", verifyToken, acceptNetworkRequest);
        router.put("/network/reject", verifyToken, rejectNetworkRequest);
        router.get("/network/requests", verifyToken, getNetworkRequests);
        router.get("/network/my", verifyToken, getMyNetwork);
        router.get("/network/users", verifyToken, getNetworkUsers);

        // =============================================
        // ⭐ FEATURED ALUMNI
        // =============================================

        router.get("/featured-alumni", getFeaturedAlumni);

        // =============================================
        // 👑 ADMIN ANALYTICS
        // =============================================

        router.get("/admin/stats", verifyToken, checkRole("admin"), getAdminStats);
        router.get("/admin/activity", verifyToken, checkRole("admin"), getAdminActivity);
        router.get("/admin/notifications", verifyToken, checkRole("admin"), getAdminNotifications);
        router.get("/admin/recent-users", verifyToken, checkRole("admin"), getRecentUsers);
        router.put("/admin/notifications/read", markNotificationsAsRead);
        router.put("/admin/update-user/:id", verifyToken, checkRole("admin"), adminUpdateUser);
        router.delete("/network/cancel", verifyToken, cancelNetworkRequest);
        router.get("/network/mutual/:targetUserId", verifyToken, getMutualConnections);

        module.exports = router;
