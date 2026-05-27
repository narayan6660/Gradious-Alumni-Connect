// origin: ["http://localhost:5173", "http://localhost:5174"];

// app.use(helmet());

// /* =========================
//     🌐 CORS CONFIGURATION
//     ========================= */

// app.use(
//     cors({
//         origin: ["http://localhost:5173", "http://localhost:5174", "https://YOUR-VERCEL-URL.vercel.app"],
//         credentials: true,
//         methods: ["GET", "POST", "PUT", "DELETE"],
//         allowedHeaders: ["Content-Type", "Authorization"],
//     })
// );

// /* =========================
//     📦 BODY PARSER
//     ========================= */

// app.use(express.json());

// /* =========================
//     📁 STATIC FILES
//     ========================= */

// app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// /* =========================
//     🚦 RATE LIMITER
//     ========================= */

// const limiter = rateLimit({
//     windowMs: 15 * 60 * 1000,
//     max: 1000,
// });

// if (process.env.NODE_ENV === "production") {
//     app.use(limiter);
// }

// /* =========================
//     📌 ROUTES
//     ========================= */

// app.use("/api/admin", adminRoutes);
// app.use("/api/auth", require("./routes/authRoutes"));
// app.use("/api/users", require("./routes/userRoutes"));

// /* =========================
//     🧪 TEST ROUTE
//     ========================= */

// app.get("/api/test", (req, res) => {
//     res.json({message: "Backend connected successfully 🚀"});
// });

// /* =========================
//     🌐 CREATE HTTP SERVER
//     ========================= */

// const server = http.createServer(app);

// /* =========================
//     🔌 SOCKET.IO SETUP
//     ========================= */

// const io = new Server(server, {
//     cors: {
//         origin: ["http://localhost:5173", "http://localhost:5174", "https://YOUR-VERCEL-URL.vercel.app"],
//         methods: ["GET", "POST"],
//     },
// });
// app.set("io", io);

// io.on("connection", (socket) => {
//     console.log("⚡ User connected:", socket.id);

//     // ✅ JOIN EVENT
//     socket.on("join", (userId) => {
//         socket.userId = userId;

//         socket.join(userId.toString());

//         console.log(`User ${userId} joined room`);

//         // ✅ add to online users
//         onlineUsers.add(userId);

//         // ✅ send BOTH list + count
//         io.emit("online_users", Array.from(onlineUsers));
//         io.emit("online_users_count", onlineUsers.size);
//     });

//     // 💬 MESSAGE EVENT
//     socket.on("sendMessage", (data) => {
//         console.log("📩 Incoming message data:", data);

//         const receiverId = data.receiverId || data.receiver_id;

//         if (!receiverId) {
//             console.log("❌ receiverId missing:", data);
//             return;
//         }

//         // ✅ FIXED: include sender_role INSIDE object
//         io.to(receiverId.toString()).emit("new_message", {
//             ...data,
//             sender_role: data.sender_role, // ✅ correct place
//         });
//     });

//     // ❌ DISCONNECT EVENT
//     socket.on("disconnect", () => {
//         console.log("❌ User disconnected:", socket.id);

//         if (socket.userId) {
//             onlineUsers.delete(socket.userId);
//         }

//         // ✅ update all clients
//         io.emit("online_users", Array.from(onlineUsers));
//         io.emit("online_users_count", onlineUsers.size);
//     });
// });

// app.get("/download/:filename", (req, res) => {
//     const filePath = path.join(__dirname, "uploads", req.params.filename);

//     console.log("Downloading:", filePath); // DEBUG

//     res.download(filePath, (err) => {
//         if (err) {
//             console.error("Download error:", err);
//             res.status(404).json({message: "File not found"});
//         }
//     });
// });

// /* =========================
//     🚀 START SERVER
//     ========================= */

// const PORT = process.env.PORT || 5000;

// server.listen(PORT, () => {
//     console.log(`🚀 Server running on port ${PORT}`);
// });

const express = require("express");
const cors = require("cors");
require("dotenv").config();
require("./config/db");

const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const http = require("http");
const {Server} = require("socket.io");

const path = require("path");

const adminRoutes = require("./routes/adminRoutes");

const app = express(); // ✅ IMPORTANT

let onlineUsers = new Set();

/* =========================
    🔒 GLOBAL MIDDLEWARES
========================= */

app.use(helmet());

/* =========================
    🌐 CORS CONFIGURATION
========================= */

app.use(
    cors({
        origin: [
            "http://localhost:5173",
            "http://localhost:5174",
            "https://gradious-alumni-connect-no3u.vercel.app",
            "https://gradious-alumni-connect-xora.vercel.app",
        ],
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

/* =========================
    📦 BODY PARSER
========================= */

app.use(express.json());

/* =========================
    📁 STATIC FILES
========================= */

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* =========================
    🚦 RATE LIMITER
========================= */

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
});

if (process.env.NODE_ENV === "production") {
    app.use(limiter);
}

/* =========================
    📌 ROUTES
========================= */

app.use("/api/admin", adminRoutes);
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));

/* =========================
    🧪 TEST ROUTE
========================= */

app.get("/api/test", (req, res) => {
    res.json({message: "Backend connected successfully 🚀"});
});

/* =========================
    🌐 CREATE HTTP SERVER
========================= */

const server = http.createServer(app);

/* =========================
    🔌 SOCKET.IO SETUP
========================= */

const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173", "http://localhost:5174", "https://gradious-alumni-connect-no3u.vercel.app"],
        methods: ["GET", "POST"],
    },
});

app.set("io", io);

/* =========================
    🔌 SOCKET EVENTS
========================= */

io.on("connection", (socket) => {
    console.log("⚡ User connected:", socket.id);

    // ✅ JOIN EVENT
    socket.on("join", (userId) => {
        socket.userId = userId;

        socket.join(userId.toString());

        console.log(`User ${userId} joined room`);

        onlineUsers.add(userId);

        io.emit("online_users", Array.from(onlineUsers));
        io.emit("online_users_count", onlineUsers.size);
    });

    // 💬 MESSAGE EVENT
    socket.on("sendMessage", (data) => {
        console.log("📩 Incoming message data:", data);

        const receiverId = data.receiverId || data.receiver_id;

        if (!receiverId) {
            console.log("❌ receiverId missing:", data);
            return;
        }

        io.to(receiverId.toString()).emit("new_message", {
            ...data,
            sender_role: data.sender_role,
        });
    });

    // ❌ DISCONNECT EVENT
    socket.on("disconnect", () => {
        console.log("❌ User disconnected:", socket.id);

        if (socket.userId) {
            onlineUsers.delete(socket.userId);
        }

        io.emit("online_users", Array.from(onlineUsers));
        io.emit("online_users_count", onlineUsers.size);
    });
});

/* =========================
    📥 DOWNLOAD ROUTE
========================= */

app.get("/download/:filename", (req, res) => {
    const filePath = path.join(__dirname, "uploads", req.params.filename);

    console.log("Downloading:", filePath);

    res.download(filePath, (err) => {
        if (err) {
            console.error("Download error:", err);
            res.status(404).json({message: "File not found"});
        }
    });
});

/* =========================
    🚀 START SERVER
========================= */

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
