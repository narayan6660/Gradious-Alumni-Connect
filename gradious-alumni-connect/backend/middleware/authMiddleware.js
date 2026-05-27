// /// ==============================
// // 🛡 AUTH MIDDLEWARE (FIXED)
// // ==============================

// const jwt = require("jsonwebtoken");

// exports.verifyToken = (req, res, next) => {
//     // 1️⃣ Get Authorization header
//     const authHeader = req.headers.authorization;

//     if (!authHeader) {
//         return res.status(403).json({
//             message: "Access Denied. No Token Provided.",
//         });
//     }

//     // 2️⃣ Extract token after "Bearer "
//     const token = authHeader.split(" ")[1];

//     if (!token) {
//         return res.status(401).json({
//             message: "Token format invalid",
//         });
//     }

//     try {
//         // 3️⃣ Verify token
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);

//         // 4️⃣ Attach user data
//         req.user = decoded;

//         next();
//     } catch (error) {
//         return res.status(401).json({
//             message: "Invalid or Expired Token",
//         });
//     }
// };

// ==============================
// 🛡 AUTH MIDDLEWARE (UPDATED)
// ==============================

const jwt = require("jsonwebtoken");
const db = require("../config/db"); // import database

exports.verifyToken = async (req, res, next) => {

    // 1️⃣ Get Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(403).json({
            message: "Access Denied. No Token Provided.",
        });
    }

    // 2️⃣ Extract token after "Bearer "
    const token = authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            message: "Token format invalid",
        });
    }

    try {

        // 3️⃣ Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 4️⃣ Attach user data to request
        req.user = decoded;

        // 5️⃣ Update last seen time
        await db.query(
            "UPDATE users SET last_seen = NOW() WHERE id = ?",
            [decoded.id]
        );

        next();

    } catch (error) {

        return res.status(401).json({
            message: "Invalid or Expired Token",
        });

    }

};