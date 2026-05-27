const db = require("../config/db");

// 🔍 Get All Users (Admin Only)
exports.getAllUsers = async (req, res) => {
    try {
        // 1️⃣ Query params
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const search = req.query.search || "";
        const sort = req.query.sort || "id";
        const order = req.query.order === "desc" ? "DESC" : "ASC";

        const offset = (page - 1) * limit;
        const searchQuery = `%${search}%`;

        // 🔒 Allow only specific columns for sorting
        const allowedSortFields = ["id", "name", "email", "role", "batch"];
        const sortField = allowedSortFields.includes(sort) ? sort : "id";

        // 2️⃣ Count total users (with search)
        const [countResult] = await db.query(
            `SELECT COUNT(*) as total 
     FROM users 
     WHERE is_deleted = FALSE
     AND (name LIKE ? OR email LIKE ?)`,
            [searchQuery, searchQuery]
        );

        const totalUsers = countResult[0].total;

        // 3️⃣ Fetch users (search + pagination + sorting)
        const [users] = await db.query(
            `batch 
     FROM users SELECT 
    id,
    name,
    email,
    role,
    course,
    batch,
    phone,
    company,
    position,
    college_name
FROM users
     WHERE is_deleted = FALSE
     AND (name LIKE ? OR email LIKE ?)
     ORDER BY ${sortField} ${order}
     LIMIT ? OFFSET ?`,
            [searchQuery, searchQuery, limit, offset]
        );

        res.status(200).json({
            message: "Users Fetched Successfully ✅",
            currentPage: page,
            totalPages: Math.ceil(totalUsers / limit),
            totalUsers,
            searchKeyword: search,
            sortBy: sortField,
            order,
            users,
        });
    } catch (error) {
        console.error("Sorting Error:", error);
        res.status(500).json({
            message: "Server Error ❌",
        });
    }
};
// ✏️ Update Profile (Logged-in User)
// ==============================

exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        // 1️⃣ Check if user exists and is active
        const [user] = await db.query("SELECT id FROM users WHERE id = ? AND is_deleted = 0", [userId]);

        if (user.length === 0) {
            return res.status(404).json({
                message: "User not found ❌",
            });
        }

const allowedFields = [
    "name",
    "phone",
    "address",
    "company",
    "position",
    "working_status",
    "bio", // ✅ ADD THIS
    "linkedin_url", // ✅ ALSO ADD THIS
];
        const updates = [];
        const values = [];

        // 2️⃣ Only update allowed & provided fields
        for (let field of allowedFields) {
            if (req.body[field] !== undefined) {
                updates.push(`${field} = ?`);
                values.push(req.body[field]);
            }
        }

        if (updates.length === 0) {
            return res.status(400).json({
                message: "No valid fields provided for update ❌",
            });
        }

        values.push(userId);

        // 3️⃣ Update query
        await db.query(`UPDATE users SET ${updates.join(", ")} WHERE id = ?`, values);

      const [updatedUser] = await db.query("SELECT * FROM users WHERE id = ?", [userId]);

      res.status(200).json({
          message: "Profile Updated Successfully ✅",
          user: updatedUser[0], // ✅ IMPORTANT
      });
    } catch (error) {
        console.error("Update Profile Error:", error);
        res.status(500).json({
            message: "Server Error ❌",
        });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const userIdToDelete = req.params.id;
        const adminId = req.user.id;

        // ❌ Prevent admin deleting himself
        if (userIdToDelete == adminId) {
            return res.status(400).json({
                message: "You cannot delete yourself ❌",
            });
        }

        // 🔎 Check user role
        const [user] = await db.query("SELECT role FROM users WHERE id = ?", [userIdToDelete]);

        if (user.length === 0) {
            return res.status(404).json({
                message: "User not found ❌",
            });
        }

        // ❌ Prevent deleting another admin
        if (user[0].role === "admin") {
            return res.status(403).json({
                message: "Admin cannot be deleted ❌",
            });
        }

        // ✅ Soft delete user
        const [result] = await db.query("UPDATE users SET is_deleted = TRUE WHERE id = ?", [userIdToDelete]);

        res.status(200).json({
            message: "User moved to trash successfully 🗑",
        });
    } catch (error) {
        console.error("Soft Delete Error:", error);
        res.status(500).json({
            message: "Server Error ❌",
        });
    }
};

exports.restoreUser = async (req, res) => {
    try {
        const userId = req.params.id;

        // 1️⃣ Check if user exists
        const [user] = await db.query("SELECT id, is_deleted FROM users WHERE id = ?", [userId]);

        if (user.length === 0) {
            return res.status(404).json({
                message: "User not found ❌",
            });
        }

        // 2️⃣ If already active
        if (!user[0].is_deleted) {
            return res.status(400).json({
                message: "User is already active ⚠️",
            });
        }

        // 3️⃣ Restore user
        await db.query("UPDATE users SET is_deleted = FALSE WHERE id = ?", [userId]);

        res.status(200).json({
            message: "User restored successfully ✅",
        });
    } catch (error) {
        console.error("Restore Error:", error);
        res.status(500).json({
            message: "Server Error ❌",
        });
    }
};

//getting deleted user

exports.getDeletedUsers = async (req, res) => {
    try {
        const [users] = await db.query(
            `SELECT 
    id,
    name,
    email,
    role,
    course,
    batch,
    phone,
    company,
    position,
    college_name
FROM users
             WHERE is_deleted = 1`
        );

        res.status(200).json({
            message: "Deleted users fetched successfully 🗑",
            totalDeletedUsers: users.length,
            users,
        });
    } catch (error) {
        console.error("Trash Fetch Error:", error);
        res.status(500).json({
            message: error.message, // 👈 show real error temporarily
        });
    }
};

// 🗑🔥 Permanent Delete (Admin Only)
exports.permanentDeleteUser = async (req, res) => {
    try {
        const userId = req.params.id;

        // 1️⃣ Check if user exists AND is already soft deleted
        const [user] = await db.query("SELECT id, is_deleted FROM users WHERE id = ?", [userId]);

        if (user.length === 0) {
            return res.status(404).json({
                message: "User not found ❌",
            });
        }

        if (user[0].is_deleted === 0) {
            return res.status(400).json({
                message: "User must be soft deleted first ⚠️",
            });
        }

        // 2️⃣ Permanently delete
        await db.query("DELETE FROM users WHERE id = ?", [userId]);

        res.status(200).json({
            message: "User permanently deleted 💀",
        });
    } catch (error) {
        console.error("Permanent Delete Error:", error);
        res.status(500).json({
            message: "Server Error ❌",
        });
    }
};

// 📊 Dashboard Stats (Admin Only)
exports.getDashboardStats = async (req, res) => {
    try {
        // 1️⃣ Total users
        const [total] = await db.query("SELECT COUNT(*) as totalUsers FROM users");

        // 2️⃣ Active users
        const [active] = await db.query("SELECT COUNT(*) as activeUsers FROM users WHERE is_deleted = 0");

        // 3️⃣ Deleted users
        const [deleted] = await db.query("SELECT COUNT(*) as deletedUsers FROM users WHERE is_deleted = 1");

        // 4️⃣ Role based counts
        const [roles] = await db.query(
            `SELECT role, COUNT(*) as count 
             FROM users 
             WHERE is_deleted = 0
             GROUP BY role`
        );

        res.status(200).json({
            message: "Dashboard stats fetched successfully 📊",
            stats: {
                totalUsers: total[0].totalUsers,
                activeUsers: active[0].activeUsers,
                deletedUsers: deleted[0].deletedUsers,
                roleBreakdown: roles,
            },
        });
    } catch (error) {
        console.error("Dashboard Stats Error:", error);
        res.status(500).json({
            message: "Server Error ❌",
        });
    }
};

// 🔎 Get Users with Search + Pagination
exports.getUsersWithPagination = async (req, res) => {
    try {
        const search = req.query.search || "";
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const offset = (page - 1) * limit;

        // Base query
      let query = `
    SELECT 
        id,
        name,
        email,
        role,
        course,
        batch,
        phone,
        company,
        position,
        college_name
    FROM users
    WHERE is_deleted = 0
`;

        let countQuery = `
            SELECT COUNT(*) as total
            FROM users
            WHERE is_deleted = 0
        `;

        let queryParams = [];
        let countParams = [];

        // If search exists
        if (search) {
            query += ` AND (name LIKE ? OR email LIKE ?)`;
            countQuery += ` AND (name LIKE ? OR email LIKE ?)`;

            queryParams.push(`%${search}%`, `%${search}%`);
            countParams.push(`%${search}%`, `%${search}%`);
        }

        // Add pagination
        query += ` LIMIT ? OFFSET ?`;
        queryParams.push(limit, offset);

        // Execute queries
        const [users] = await db.query(query, queryParams);
        const [totalResult] = await db.query(countQuery, countParams);

        const totalUsers = totalResult[0].total;
        const totalPages = Math.ceil(totalUsers / limit);

        res.status(200).json({
            message: "Users fetched successfully 🔎",
            currentPage: page,
            totalPages,
            totalUsers,
            users,
        });
    } catch (error) {
        console.error("Pagination Error:", error);
        res.status(500).json({
            message: "Server Error ❌",
        });
    }
};

const bcrypt = require("bcrypt");

// 🔐 Change Password
exports.changePassword = async (req, res) => {
    try {
        const userId = req.user.id; // from token
        const {oldPassword, newPassword} = req.body;

        // 1️⃣ Get user from DB
        const [user] = await db.query("SELECT password FROM users WHERE id = ? AND is_deleted = 0", [userId]);

        if (user.length === 0) {
            return res.status(404).json({
                message: "User not found ❌",
            });
        }

        // 2️⃣ Compare old password
        const isMatch = await bcrypt.compare(oldPassword, user[0].password);

        if (!isMatch) {
            return res.status(400).json({
                message: "Old password is incorrect ❌",
            });
        }

        // 3️⃣ Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // 4️⃣ Update password
        await db.query("UPDATE users SET password = ? WHERE id = ?", [hashedPassword, userId]);

        res.status(200).json({
            message: "Password changed successfully 🔐",
        });
    } catch (error) {
        console.error("Change Password Error:", error);
        res.status(500).json({
            message: "Server Error ❌",
        });
    }
};

const {Parser} = require("json2csv");

// 📁 Export Users (Admin Only)
exports.exportUsers = async (req, res) => {
    try {
        // Get active users only
        const [users] = await db.query("SELECT id, name, email, role, course, batch FROM users WHERE is_deleted = 0");

        if (users.length === 0) {
            return res.status(404).json({
                message: "No users found ❌",
            });
        }

        const fields = ["id", "name", "email", "role", "course", "batch"];
        const json2csvParser = new Parser({fields});

        const csv = json2csvParser.parse(users);

        res.header("Content-Type", "text/csv");
        res.attachment("users.csv");
        res.send(csv);
    } catch (error) {
        console.error("Export Error:", error);
        res.status(500).json({
            message: "Server Error ❌",
        });
    }
};

// 📊 Monthly User Growth (Admin Only)
exports.getMonthlyGrowth = async (req, res) => {
    try {
        const [growth] = await db.query(`
            SELECT 
                DATE_FORMAT(created_at, '%Y-%m') as month,
                COUNT(*) as totalUsers
            FROM users
            WHERE is_deleted = 0
            GROUP BY month
            ORDER BY month ASC
        `);

        res.status(200).json({
            message: "Monthly growth data fetched 📊",
            data: growth,
        });
    } catch (error) {
        console.error("Monthly Growth Error:", error);
        res.status(500).json({
            message: "Server Error ❌",
        });
    }
};

exports.cancelNetworkRequest = async (req, res) => {
    try {
        const senderId = req.user.id;
        const {receiverId} = req.body;

        await db.query(
            `DELETE FROM network_connections 
             WHERE sender_id = ? AND receiver_id = ? AND status = 'pending'`,
            [senderId, receiverId]
        );

        res.json({message: "Request cancelled ❌"});
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Server error ❌"});
    }
};
exports.getMutualConnections = async (req, res) => {
    try {
        const userId = req.user.id;
        const {targetUserId} = req.params;

        const [mutuals] = await db.query(
            `
            SELECT u.id, u.name
            FROM network_connections nc1
            JOIN network_connections nc2
                ON nc1.receiver_id = nc2.receiver_id
            JOIN users u
                ON u.id = nc1.receiver_id

            WHERE 
                nc1.sender_id = ?
                AND nc2.sender_id = ?
                AND nc1.status = 'accepted'
                AND nc2.status = 'accepted'
            `,
            [userId, targetUserId]
        );

        res.json({mutuals});
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Error ❌"});
    }
};

exports.getProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const [user] = await db.query(
            `SELECT 
            name,
            email,
            phone,
            course,
            batch,
            gender,
            address,
            linkedin_url
            FROM users
            WHERE id = ?`,
            [userId]
        );

        if (user.length === 0) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        res.status(200).json({
            profile: user[0],
        });
    } catch (error) {
        console.error("Profile Fetch Error:", error);

        res.status(500).json({
            message: "Server Error",
        });
    }
};
// GET MESSAGES
// ==============================
exports.getMessages = async (req, res) => {
    try {
        const senderId = req.user.id;
        const receiverId = req.params.userId;

        // 🔥 ROLE-BASED PERMISSION CHECK

        // 1️⃣ Get both users
        const [users] = await db.query("SELECT id, role FROM users WHERE id IN (?, ?)", [senderId, receiverId]);

        if (users.length < 2) {
            return res.status(404).json({message: "User not found ❌"});
        }

        const sender = users.find((u) => u.id == senderId);
        const receiver = users.find((u) => u.id == receiverId);

        // 2️⃣ Decide permission
        let isAllowed = false;

        // ✅ Admin → anyone
        if (sender.role === "admin") {
            isAllowed = true;
        }
        // ✅ Alumni → admin
        else if (receiver.role === "admin") {
            isAllowed = true;
        }
        // ✅ Alumni ↔ Alumni (must be connected)
        else {
            const [connection] = await db.query(
                `SELECT * FROM network_connections 
         WHERE 
            ((sender_id = ? AND receiver_id = ?) 
             OR (sender_id = ? AND receiver_id = ?))
         AND status = 'accepted'`,
                [senderId, receiverId, receiverId, senderId]
            );

            if (connection.length > 0) {
                isAllowed = true;
            }
        }

        // ❌ Final block
        if (!isAllowed) {
            return res.status(403).json({
                message: "You are not allowed to message this user ❌",
            });
        }

        // ✅ 2. FETCH MESSAGES
        const [messages] = await db.query(
            `
            SELECT 
                id,
                sender_id,
                receiver_id,
                message,
                file_url,
                seen,
                created_at
            FROM messages
            WHERE 
                (sender_id=? AND receiver_id=?)
                OR 
                (sender_id=? AND receiver_id=?)
            ORDER BY created_at ASC
            `,
            [senderId, receiverId, receiverId, senderId]
        );

        res.json({messages});
    } catch (error) {
        console.error("Get Messages Error:", error);
        res.status(500).json({message: "Server error"});
    }
};

exports.sendMessage = async (req, res) => {
    try {
        const senderId = req.user.id;
        const {receiverId, message} = req.body;
        // ❌ PREVENT SELF MESSAGE
        if (Number(senderId) === Number(receiverId)) {
            return res.status(400).json({
                message: "You cannot message yourself ❌",
            });
        }
        let fileUrl = null;

        if (req.file) {
            fileUrl = `/uploads/${req.file.filename}`;
        }

        // 🔥 ROLE-BASED PERMISSION CHECK

        // 1️⃣ Get both users
        const [users] = await db.query("SELECT id, role FROM users WHERE id IN (?, ?)", [senderId, receiverId]);

        if (users.length < 2) {
            return res.status(404).json({message: "User not found ❌"});
        }

        const sender = users.find((u) => u.id == senderId);
        const receiver = users.find((u) => u.id == receiverId);

        // 2️⃣ Decide permission
        let isAllowed = false;

        // ✅ Admin → anyone
        if (sender.role === "admin") {
            isAllowed = true;
        }
        // ✅ Alumni → admin
        else if (receiver.role === "admin") {
            isAllowed = true;
        }
        // ✅ Alumni ↔ Alumni (must be connected)
        else {
            const [connection] = await db.query(
                `SELECT * FROM network_connections 
         WHERE 
            ((sender_id = ? AND receiver_id = ?) 
             OR (sender_id = ? AND receiver_id = ?))
         AND status = 'accepted'`,
                [senderId, receiverId, receiverId, senderId]
            );

            if (connection.length > 0) {
                isAllowed = true;
            }
        }

        // ❌ Final block
        if (!isAllowed) {
            return res.status(403).json({
                message: "You are not allowed to message this user ❌",
            });
        }

        // 📝 2. SAVE MESSAGE
        const [result] = await db.query(
            `INSERT INTO messages (sender_id, receiver_id, message, file_url)
             VALUES (?, ?, ?, ?)`,
            [senderId, receiverId, message || "", fileUrl]
        );

        // 🔥 3. REAL-TIME SOCKET EMIT
        const io = req.app.get("io");

        io.to(receiverId.toString()).emit("new_message", {
            id: result.insertId,
            sender_id: senderId,
            sender_name: sender.name,
            receiver_id: receiverId,
            message,
            file_url: fileUrl,
            created_at: new Date(),
        });

        // 📤 4. RESPONSE
        res.json({
            message: {
                id: result.insertId,
                sender_id: senderId,
                receiver_id: receiverId,
                message,
                file_url: fileUrl,
                created_at: new Date(),
            },
        });
    } catch (error) {
        console.error("Send Message Error:", error);
        res.status(500).json({message: "Server error"});
    }
};
// ==============================
// GET USER BY ID (for chat header)
// ==============================

exports.getUserById = async (req, res) => {
    try {
        const {id} = req.params;

        const [user] = await db.query(
            `SELECT 
                id,
                name,
                email,
                college_name,
                course,
                batch,
                company,
                position,
                linkedin_url
            FROM users
            WHERE id = ?`,
            [id]
        );

        if (user.length === 0) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        res.json({
            user: user[0],
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error",
        });
    }
};

exports.getMessageUsers = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;

        let users;

        // 🔥 ADMIN → see ALL users who sent/received messages
        // 🔥 ADMIN → only users who chatted with THIS admin
        if (userRole === "admin") {
            const [rows] = await db.query(
                `
        SELECT DISTINCT 
            u.id,
            u.name,
            u.company,

            (
                SELECT m2.message 
                FROM messages m2
                WHERE 
                    (m2.sender_id = u.id AND m2.receiver_id = ?)
                    OR
                    (m2.sender_id = ? AND m2.receiver_id = u.id)
                ORDER BY m2.created_at DESC
                LIMIT 1
            ) AS lastMessage,

            (
                SELECT MAX(m3.created_at)
                FROM messages m3
                WHERE 
                    (m3.sender_id = u.id AND m3.receiver_id = ?)
                    OR
                    (m3.sender_id = ? AND m3.receiver_id = u.id)
            ) AS lastMessageTime,

            (
                SELECT COUNT(*)
                FROM messages m4
                WHERE 
                    m4.sender_id = u.id 
                    AND m4.receiver_id = ?
                    AND m4.seen = 0
            ) AS unreadCount

        FROM users u

        WHERE u.role = 'alumni'
        AND EXISTS (
            SELECT 1 FROM messages m
            WHERE 
                (m.sender_id = u.id AND m.receiver_id = ?)
                OR
                (m.sender_id = ? AND m.receiver_id = u.id)
        )

        ORDER BY lastMessageTime DESC
    `,
                [userId, userId, userId, userId, userId, userId, userId]
            );

            users = rows;
        }
        // 🔥 ALUMNI → existing logic (connections)
        else {
            const [rows] = await db.query(
                `
                SELECT u.id, u.name, u.company
                FROM users u
                JOIN network_connections nc 
                ON (nc.sender_id = u.id OR nc.receiver_id = u.id)
                WHERE (nc.sender_id = ? OR nc.receiver_id = ?)
                AND nc.status = 'accepted'
                AND u.id != ?
            `,
                [userId, userId, userId]
            );

            users = rows;
        }

        res.json({users});
    } catch (err) {
        console.error(err);
        res.status(500).json({message: "Error fetching users"});
    }
};
exports.getNotifications = async (req, res) => {
    try {
        const userId = req.user.id;

        // unread messages
        const [messages] = await db.query(
            `
            SELECT 
                m.id,
                m.message,
                m.created_at,
                u.name AS sender_name,
                u.id AS sender_id
            FROM messages m
            JOIN users u ON m.sender_id = u.id
            WHERE m.receiver_id = ?
            AND m.seen = 0
            ORDER BY m.created_at DESC
            LIMIT 5
        `,
            [userId]
        );

        const [requests] = await db.query(
            `
SELECT 
u.name,
u.id
FROM network_connections n
JOIN users u ON n.sender_id = u.id
WHERE n.receiver_id = ?
AND n.status = 'pending'
`,
            [userId]
        );
        res.json({
            pendingRequests: requests.length,
            unreadMessages: messages.length,
            messageNotifications: messages,
            requestNotifications: requests,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error",
        });
    }
};

exports.getChatUsers = async (req, res) => {
    try {
        const userId = req.user.id;

        const [users] = await db.query(
            `
            SELECT id, name, email
            FROM users
            WHERE id IN (
                SELECT receiver_id FROM messages WHERE sender_id = ?
                UNION
                SELECT sender_id FROM messages WHERE receiver_id = ?
            )
        `,
            [userId, userId]
        );

        res.json({
            users,
        });
    } catch (error) {
        console.error("Chat Users Error:", error);

        res.status(500).json({
            message: "Server error",
        });
    }
};

// ==============================
// 📊 ALUMNI DASHBOARD STATS
// ==============================

exports.getAlumniDashboard = async (req, res) => {
    console.log("DASHBOARD API HIT");
    try {
        const alumniId = req.user.id;

        // Pending requests
        const [pending] = await db.query(
            `-- Pending
SELECT COUNT(*) AS total
FROM network_connections
WHERE receiver_id = ? AND status = 'pending'`,
            [alumniId]
        );

        // Accepted connections
        const [connections] = await db.query(
            `SELECT COUNT(*) AS total
     FROM network_connections
     WHERE (receiver_id = ? OR sender_id = ?) 
     AND status = 'accepted'`,
            [alumniId, alumniId]
        );

        // Messages received
        const [messages] = await db.query(
            `SELECT COUNT(*) AS total
     FROM messages
     WHERE receiver_id = ? AND seen = FALSE`,
            [alumniId]
        );

        res.json({
            pendingRequests: pending[0].total,
            connections: connections[0].total,
            messages: messages[0].total,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Failed to load alumni dashboard"});
    }
};

// exports.getUserProfile = async (req, res) => {
//     try {
//         const userId = req.params.userId;

//         const [user] = await db.query(
//             `SELECT 
//                 id,
//                 name,
//                 email,
//                 role,
//                 course,
//                 batch,
//                 company,
//                 last_seen
//             FROM users
//             WHERE id = ?`,
//             [userId]
//         );

//         res.json({
//             user: user[0],
//         });
//     } catch (error) {
//         console.error(error);

//         res.status(500).json({
//             message: "Server error",
//         });
//     }
// };
exports.getUserProfile = async (req, res) => {
    try {
        const userId = req.params.id;

        const [rows] = await db.query(
            `SELECT 
                id,
                name,
                email,
                role,
                college_name,
                course,
                batch,
                company,
                position,
                address,
                bio,
                linkedin_url
            FROM users
            WHERE id = ? AND is_deleted = 0`, // ✅ THIS LINE UPDATED
            [userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                message: "User not found ❌",
            });
        }

        res.json({
            user: rows[0],
        });
    } catch (error) {
        console.error("Get Profile Error:", error);
        res.status(500).json({
            message: "Server error ❌",
        });
    }
};
exports.sendNetworkRequest = async (req, res) => {
    try {
        const senderId = req.user.id;
        const {receiverId} = req.body;

        if (!receiverId) {
            return res.status(400).json({
                message: "Receiver ID missing ❌",
            });
        }

        if (senderId === receiverId) {
            return res.status(400).json({
                message: "You cannot connect with yourself ❌",
            });
        }

        // 🔥 FIX STARTS HERE
        const [receiverRows] = await db.query("SELECT role FROM users WHERE id = ?", [receiverId]);

        if (receiverRows.length === 0) {
            return res.status(404).json({
                message: "User not found ❌",
            });
        }

        const receiver = receiverRows[0];
        // 🔥 FIX ENDS HERE

        if (receiver.role === "admin") {
            return res.status(403).json({
                message: "You cannot send request to admin ❌",
            });
        }

        // 🔎 Check existing
        const [existing] = await db.query(
            `SELECT * FROM network_connections
             WHERE (
                (sender_id=? AND receiver_id=?)
                OR
                (sender_id=? AND receiver_id=?)
             )
             AND status != 'rejected'`,
            [senderId, receiverId, receiverId, senderId]
        );

        if (existing.length > 0) {
            return res.status(400).json({
                message: "Connection already exists ⚠️",
            });
        }

        // ✅ Insert request
        await db.query(
            `INSERT INTO network_connections (sender_id, receiver_id, status)
             VALUES (?, ?, 'pending')`,
            [senderId, receiverId]
        );

        const [[user]] = await db.query("SELECT name FROM users WHERE id = ?", [senderId]);

        // 🔔 notification
        await db.query(
            `INSERT INTO notifications (user_id, message)
             VALUES (?, ?)`,
            [receiverId, `${user.name} sent you a connection request`]
        );

        // 🔥 socket
        const io = req.app.get("io");

        io.to(receiverId.toString()).emit("new_connection_request", {
            senderId,
            senderName: user.name,
        });

        res.status(200).json({
            message: "Network request sent ✅",
        });
    } catch (error) {
        console.error("Network Request Error:", error);

        res.status(500).json({
            message: "Server Error ❌",
        });
    }
};

exports.acceptNetworkRequest = async (req, res) => {
    try {
        console.log("✅ ACCEPT API HIT");

        const receiverId = req.user.id;
        const {senderId} = req.body;

        const [result] = await db.query(
            `UPDATE network_connections
             SET status='accepted'
             WHERE sender_id=? AND receiver_id=?`,
            [senderId, receiverId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Request not found ❌",
            });
        }

        const [[receiver]] = await db.query("SELECT name FROM users WHERE id = ?", [receiverId]);

        // 🔔 Notification for sender (EXISTING)
        await db.query(
            `INSERT INTO notifications (user_id, message)
             VALUES (?, ?)`,
            [senderId, `${receiver.name} accepted your connection request 🤝`]
        );

        // 🔥 NEW: Notification for ADMIN
        await db.query(
            `INSERT INTO notifications (user_id, message)
             VALUES (?, ?)`,
            [null, `${receiver.name} accepted a connection request`]
        );

        console.log("✅ Notification inserted for:", senderId);

        res.json({
            message: "Connection accepted ✅",
        });
    } catch (error) {
        console.error("❌ ERROR:", error);
        res.status(500).json({
            message: "Server error ❌",
        });
    }
};

// 📩 Get Network Requests
// ==============================

exports.getNetworkRequests = async (req, res) => {
    try {
        const userId = req.user.id;

        const [requests] = await db.query(
            `
            SELECT 
                u.id,
                u.name,
                u.email,
                u.role
            FROM network_connections n
            JOIN users u ON n.sender_id = u.id
            WHERE n.receiver_id = ?
            AND n.status='pending'
        `,
            [userId]
        );

        res.json({
            requests,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error",
        });
    }
}; // ==============================
// 🤝 Get My Network
// ==============================

// exports.getMyNetwork = async (req, res) => {
//     try {
//         const userId = req.user.id;
// const [connections] = await db.query(
//     `
//     SELECT
//         u.id,
//         u.name,
//         u.email,
//         u.role,
//         u.company,
//         u.position,
//         u.course,
//         u.batch
//     FROM network_connections n
//     JOIN users u
//     ON u.id =
//         CASE
//             WHEN n.sender_id = ? THEN n.receiver_id
//             ELSE n.sender_id
//         END
//     WHERE
//         (n.sender_id = ? OR n.receiver_id = ?)
//         AND n.status = 'accepted'
//         AND u.role = 'student'
//     `,
//     [userId, userId, userId]
// );

//         res.json({
//             connections,
//         });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({
//             message: "Server error",
//         });
//     }
// };
exports.getMyNetwork = async (req, res) => {
    try {
        const userId = req.user.id;
const [connections] = await db.query(
    `
    SELECT DISTINCT
        u.id,
        u.name,
        u.email,
        u.role,
        u.company,
        u.position,
        u.course,
        u.batch,
        n.status AS connectionStatus   -- ✅ THIS IS THE FIX
    FROM network_connections n
    JOIN users u 
        ON u.id = 
            CASE 
                WHEN n.sender_id = ? THEN n.receiver_id
                ELSE n.sender_id
            END
    WHERE 
        (n.sender_id = ? OR n.receiver_id = ?)
        AND n.status = 'accepted'
    `,
    [userId, userId, userId]
);

        res.json({connections});
    } catch (error) {
        console.error("GetMyNetwork Error:", error);
        res.status(500).json({message: "Server error"});
    }
};
exports.sendFileMessage = async (req, res) => {
    try {
        const senderId = req.user.id;
        const receiverId = req.body.receiverId;

        if (!req.file) {
            return res.status(400).json({message: "No file uploaded"});
        }

        const fileUrl = `uploads/${req.file.filename}`;

        // insert message with empty text
        const [result] = await db.query(
            `INSERT INTO messages (sender_id, receiver_id, message, file_url)
             VALUES (?, ?, ?, ?)`,
            [senderId, receiverId, "", fileUrl]
        );

        const message = {
            id: result.insertId,
            sender_id: senderId,
            receiver_id: receiverId,
            message: "",
            file_url: fileUrl,
            created_at: new Date(),
        };

        res.json({message});
    } catch (error) {
        console.error("File Upload Error:", error);

        res.status(500).json({message: "File upload failed"});
    }
};

// exports.getNetworkUsers = async (req, res) => {
//     try {
//         const userId = req.user.id;

//      const [users] = await db.query(
//          `
//     SELECT
//         u.id,
//         u.name,
//         u.email,
//         u.role,
//         u.course,
//         u.batch,
//         u.company,
//         u.position

//     FROM users u

//     WHERE
//         u.id != ?
//         AND u.is_deleted = 0
//         AND u.role != 'admin'

//         AND u.id NOT IN (
//             SELECT
//                 CASE
//                     WHEN sender_id = ? THEN receiver_id
//                     ELSE sender_id
//                 END
//             FROM network_connections
//             WHERE
//                 (sender_id = ? OR receiver_id = ?)
//                 AND status IN ('accepted', 'pending')
//         )
//     `,
//          [userId, userId, userId, userId]
//      );

//         res.json({
//             total: users.length,
//             users,
//         });
//     } catch (error) {
//         console.error("Network Users Error:", error);

//         res.status(500).json({
//             message: "Server error",
//         });
//     }
// };
exports.getNetworkUsers = async (req, res) => {
    try {
        const userId = req.user.id;

        const [users] = await db.query(
            `
            SELECT 
                u.id,
                u.name,
                u.email,
                u.role,
                u.course,
                u.batch,
                u.company,
                u.position,

                (
                    SELECT status 
                    FROM network_connections 
                    WHERE sender_id = ? AND receiver_id = u.id
                    LIMIT 1
                ) AS sentStatus,

                (
                    SELECT status 
                    FROM network_connections 
                    WHERE sender_id = u.id AND receiver_id = ?
                    LIMIT 1
                ) AS receivedStatus

            FROM users u
            WHERE 
                u.id != ?
                AND u.is_deleted = 0
                AND u.role != 'admin'
            `,
            [userId, userId, userId]
        );

        // ✅ Process connection status safely
        const processedUsers = users.map((u) => {
            const sent = u.sentStatus || null;
            const received = u.receivedStatus || null;

            let connectionStatus = "none";

            if (sent === "accepted" || received === "accepted") {
                connectionStatus = "accepted";
            } else if (sent === "pending") {
                connectionStatus = "sent";
            } else if (received === "pending") {
                connectionStatus = "received";
            }

            return {...u, connectionStatus};
        });

        res.json({
            total: processedUsers.length,
            users: processedUsers,
        });
    } catch (error) {
        console.error("Network Users Error:", error);
        res.status(500).json({message: "Server error"});
    }
};
exports.rejectNetworkRequest = async (req, res) => {
    try {
        const userId = req.user.id;
        const {senderId} = req.body;

        await db.query(
            `UPDATE network_connections
SET status='rejected'
WHERE sender_id=? AND receiver_id=?`,
            [senderId, userId]
        );

        res.json({
            message: "Request rejected",
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error",
        });
    }
};

exports.getPlatformStats = async (req, res) => {
    try {
        const [alumni] = await db.query("SELECT COUNT(*) AS total FROM users WHERE role='alumni' AND is_deleted=0");

        const [connections] = await db.query(
            "SELECT COUNT(*) AS total FROM network_connections WHERE status='accepted'"
        );

        res.json({
            totalAlumni: alumni[0].total,
            totalConnections: connections[0].total,
        });
    } catch (error) {
        console.error("Platform stats error:", error);
        res.status(500).json({message: "Server error"});
    }
};

exports.getFeaturedAlumni = async (req, res) => {
    try {
        const [alumni] = await db.query(`
            SELECT id, name, company, position
            FROM users
            WHERE role='alumni'
            AND is_deleted=0
            ORDER BY created_at DESC
            LIMIT 3
        `);

        res.json(alumni);
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Server error"});
    }
};

exports.getAdminStats = async (req, res) => {
    try {
        const [[users]] = await db.query("SELECT COUNT(*) as totalUsers FROM users WHERE is_deleted=0");

        const [[alumni]] = await db.query(
            "SELECT COUNT(*) as totalAlumni FROM users WHERE role='alumni' AND is_deleted=0"
        );

        const [[admins]] = await db.query(
            "SELECT COUNT(*) as totalAdmins FROM users WHERE role='admin' AND is_deleted=0"
        );

        const [[connections]] = await db.query(
            "SELECT COUNT(*) as totalConnections FROM network_connections WHERE status='accepted'"
        );

        const [[deleted]] = await db.query("SELECT COUNT(*) as deletedUsers FROM users WHERE is_deleted=1");

        res.json({
            totalUsers: users.totalUsers,
            totalAlumni: alumni.totalAlumni,
            totalAdmins: admins.totalAdmins,
            totalConnections: connections.totalConnections,
            deletedUsers: deleted.deletedUsers,
        });
    } catch (error) {
        res.status(500).json({message: "Server error"});
    }
};

exports.getAdminActivity = async (req, res) => {
    try {
        let {page = 1, limit = 5, type} = req.query;

        page = parseInt(page);
        limit = parseInt(limit);

        const offset = (page - 1) * limit;

        let activity = [];

        // 🔥 REGISTER USERS (FIXED)
        if (!type || type === "all" || type === "register") {
            const [users] = await db.query(`
                SELECT name, created_at as time, 'register' as type
                FROM users
                ORDER BY created_at DESC
                LIMIT 20
            `);
            activity.push(...users);
        }

        // 🔥 CONNECTIONS (FIXED)
        if (!type || type === "all" || type === "connection") {
            const [connections] = await db.query(`
                SELECT u.name, nc.created_at as time, 'connection' as type
                FROM network_connections nc
                JOIN users u ON u.id = nc.sender_id
                WHERE nc.status = 'accepted'
                ORDER BY nc.created_at DESC
                LIMIT 20
            `);
            activity.push(...connections);
        }

        // 🔥 MESSAGES
        if (!type || type === "all" || type === "message") {
            const [messages] = await db.query(`
                SELECT u.name, m.created_at as time, 'message' as type
                FROM messages m
                JOIN users u ON m.sender_id = u.id
                ORDER BY m.created_at DESC
                LIMIT 20
            `);
            activity.push(...messages);
        }

        // 🔥 SORT ALL
        activity.sort((a, b) => new Date(b.time) - new Date(a.time));

        const total = activity.length;
        const paginatedActivity = activity.slice(offset, offset + limit);

        res.json({
            activity: paginatedActivity,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            total,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Server error"});
    }
};

exports.getAdminNotifications = async (req, res) => {
    try {
        const [notifications] = await db.query(
            `
            SELECT id, message, created_at
            FROM notifications
            WHERE user_id IS NULL AND is_read = 0
            ORDER BY created_at DESC
            LIMIT 5
        `
        );

        res.json({notifications});
    } catch (error) {
        console.error("Get Notifications Error:", error);

        res.status(500).json({
            message: "Server Error ❌",
        });
    }
};
// ==============================
// 👤 RECENT REGISTERED USERS (ADMIN)
// ==============================

exports.getRecentUsers = async (req, res) => {
    try {
        const [users] = await db.query(`
            SELECT id, name, email, role, created_at
            FROM users
            WHERE is_deleted = 0
            ORDER BY created_at DESC
            LIMIT 5
        `);

        res.json({
            users,
        });
    } catch (error) {
        console.error("Recent users error:", error);

        res.status(500).json({
            message: "Server error",
        });
    }
};

exports.markNotificationsAsRead = async (req, res) => {
    try {
        await db.query(`
            UPDATE notifications
            SET is_read = true
            WHERE is_read = false
        `);

        res.json({
            message: "Notifications marked as read ✅",
        });
    } catch (error) {
        console.error("Mark Read Error:", error);

        res.status(500).json({
            message: "Server Error ❌",
        });
    }
};
// ==============================
// 👑 ADMIN UPDATE USER PROFILE
// ==============================

exports.adminUpdateUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const adminId = req.user.id;

        // 1️⃣ Check user exists
        const [user] = await db.query("SELECT id, role FROM users WHERE id = ?", [userId]);

        if (user.length === 0) {
            return res.status(404).json({
                message: "User not found ❌",
            });
        }

        // ❌ Prevent updating admin
        if (user[0].role === "admin") {
            return res.status(403).json({
                message: "Cannot update admin ❌",
            });
        }

        // 2️⃣ Allowed fields (BASED ON YOUR DB)
        const allowedFields = [
            "name",
            "email",
            "phone",
            "course",
            "batch",
            "company",
            "position",
            "college_name",
            "linkedin_url",
        ];

        const updates = [];
        const values = [];

        // 3️⃣ Dynamic update
        for (let field of allowedFields) {
            if (req.body[field] !== undefined) {
                updates.push(`${field} = ?`);
                values.push(req.body[field]);
            }
        }

        if (updates.length === 0) {
            return res.status(400).json({
                message: "No valid fields provided ❌",
            });
        }

        values.push(userId);

        // 4️⃣ Execute update
        await db.query(`UPDATE users SET ${updates.join(", ")} WHERE id = ?`, values);

        res.json({
            message: "User updated by admin ✅",
        });
    } catch (error) {
        console.error("Admin Update Error:", error);
        res.status(500).json({
            message: "Server error ❌",
        });
    }
};

exports.markAdminNotificationsRead = async (req, res) => {
    try {
        const [result] = await db.query("UPDATE notifications SET is_read = 1");

        console.log("Updated rows:", result.affectedRows);

        res.json({message: "Notifications marked as read ✅"});
    } catch (error) {
        console.error("Mark Read Error:", error);

        res.status(500).json({
            message: "Server Error ❌",
        });
    }
};

exports.getAlumniAnalytics = async (req, res) => {
    try {
        const alumniId = req.user.id;

        // 📊 Last 5 days connections
        const [connections] = await db.query(
            `
    SELECT 
        DATE(created_at) as day,
        COUNT(*) as connections
    FROM network_connections
    WHERE (receiver_id = ? OR sender_id = ?)
    AND status = 'accepted'
    GROUP BY DATE(created_at)
    ORDER BY day DESC
    LIMIT 5
`,
            [alumniId, alumniId]
        );

        // 📊 Last 5 days messages
        const [messages] = await db.query(
            `
            SELECT 
                DATE(created_at) as day,
                COUNT(*) as messages
            FROM messages
            WHERE receiver_id = ?
            GROUP BY DATE(created_at)
            ORDER BY day DESC
            LIMIT 5
        `,
            [alumniId]
        );

        // 🔄 Merge data
        const map = {};

        connections.forEach((c) => {
            map[c.day] = {
                day: c.day,
                connections: c.connections,
                messages: 0,
            };
        });

        messages.forEach((m) => {
            if (!map[m.day]) {
                map[m.day] = {
                    day: m.day,
                    connections: 0,
                    messages: m.messages,
                };
            } else {
                map[m.day].messages = m.messages;
            }
        });

        // 📈 Convert to array + sort
        const chartData = Object.values(map).sort((a, b) => new Date(a.day) - new Date(b.day));

        res.json({
            chartData,
        });
    } catch (error) {
        console.error("Analytics Error:", error);
        res.status(500).json({message: "Server error"});
    }
};

exports.getAlumniActivity = async (req, res) => {
    try {
        const userId = req.user.id;

        // 📩 Messages activity
        const [messages] = await db.query(
            `
            SELECT m.created_at, u.name
            FROM messages m
            JOIN users u ON u.id = m.sender_id
            WHERE m.receiver_id = ?
            ORDER BY m.created_at DESC
            LIMIT 5
        `,
            [userId]
        );

        // 🤝 Connections activity
        const [connections] = await db.query(
            `
            SELECT nc.created_at, u.name
            FROM network_connections nc
            JOIN users u ON u.id = nc.sender_id
            WHERE nc.receiver_id = ? AND nc.status = 'accepted'
            ORDER BY nc.created_at DESC
            LIMIT 5
        `,
            [userId]
        );

        // 📥 Requests activity
        const [requests] = await db.query(
            `
            SELECT nc.created_at, u.name
            FROM network_connections nc
            JOIN users u ON u.id = nc.sender_id
            WHERE nc.receiver_id = ? AND nc.status = 'pending'
            ORDER BY nc.created_at DESC
            LIMIT 5
        `,
            [userId]
        );

        // 🔄 Merge all
        const activity = [];

        messages.forEach((m) => {
            activity.push({
                type: "message",
                name: m.name,
                time: m.created_at,
            });
        });

        connections.forEach((c) => {
            activity.push({
                type: "connection",
                name: c.name,
                time: c.created_at,
            });
        });

        requests.forEach((r) => {
            activity.push({
                type: "request",
                name: r.name,
                time: r.created_at,
            });
        });

        // 🧠 Sort latest first
        activity.sort((a, b) => new Date(b.time) - new Date(a.time));

        res.json({
            activity: activity.slice(0, 5),
        });
    } catch (error) {
        console.error("Activity Error:", error);
        res.status(500).json({message: "Server error"});
    }
};

exports.markMessagesAsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        const senderId = req.body.senderId;

        await db.query(
            `
            UPDATE messages
            SET seen = TRUE
            WHERE sender_id = ? AND receiver_id = ? AND seen = FALSE
            `,
            [senderId, userId]
        );

        res.json({success: true});
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Server error"});
    }
};
