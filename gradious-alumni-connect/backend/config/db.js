// // ==============================
// // 🗄 DATABASE CONNECTION (PROMISE VERSION)
// // ==============================

// const mysql = require("mysql2/promise");
// require("dotenv").config();

// const db = mysql.createPool({
//     host: process.env.DB_HOST,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_NAME,
// });

// // Optional test connection
// (async () => {
//     try {
//         const connection = await db.getConnection();
//         console.log("✅ MySQL Connected Successfully");
//         connection.release();
//     } catch (error) {
//         console.error("❌ Database connection failed:", error);
//     }
// })();

// module.exports = db;

const mysql = require("mysql2");

console.log("DB_USER =", process.env.DB_USER);
console.log("DB_HOST =", process.env.DB_HOST);
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,

    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,

    ssl: {
        rejectUnauthorized: false,
    },

    connectTimeout: 60000,
});

pool.getConnection((err, connection) => {
    if (err) {
        console.error("Database connection failed:", err);
    } else {
        console.log("✅ MySQL Connected");
        connection.release();
    }
});

module.exports = pool.promise();
