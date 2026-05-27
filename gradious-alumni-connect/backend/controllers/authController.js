

console.log("AUTH CONTROLLER LOADED");

const db = require("../config/db");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
exports.register = async (req, res) => {
    try {
        const {
            name,
            email,
            phone,
            password,
            role,
            course,
            college_name,
            batch,
            gender,
            address,
            working_status,
            company,
            position,
            linkedin_url,
        } = req.body;
const userRole = role === "admin" ? "admin" : "alumni";
        // Check existing email
        const [existingUser] = await db.query("SELECT id FROM users WHERE email = ?", [email]);

        if (existingUser.length > 0) {
            return res.status(400).json({
                message: "Email already registered ❌",
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user
        await db.query(
            `INSERT INTO users
            (name,email,phone,password,role,course,college_name,batch,gender,address,working_status,company,position,linkedin_url)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            [
                name,
                email,
                phone || null,
                hashedPassword,
               userRole,
                course || null,
                college_name || null,
                batch || null,
                gender || null,
                address || null,
                working_status || "not_working",
                company || null,
                position || null,
                linkedin_url || null,
            ]
        );

        // 🔥 ADD NOTIFICATION
        await db.query(`INSERT INTO notifications (message) VALUES (?)`, [`${name} registered as ${userRole}`]);

        // Response
        res.status(201).json({
            message: "Registration successful ✅",
        });
    } catch (error) {
        console.error("Register Error:", error);

        res.status(500).json({
            message: "Server Error ❌",
        });
    }
};
// ==============================
// LOGIN USER
// ==============================

exports.login = async (req, res) => {
    try {
        const {email, password} = req.body;

        const [user] = await db.query("SELECT * FROM users WHERE email = ? AND is_deleted = 0", [email]);

        if (user.length === 0) {
            return res.status(400).json({
                message: "Invalid email or password ❌",
            });
        }

        const existingUser = user[0];

        // Check if account is locked
        if (existingUser.lock_until && new Date() < new Date(existingUser.lock_until)) {
            return res.status(403).json({
                message: "Account locked. Try again later 🔒",
            });
        }

        const isMatch = await bcrypt.compare(password, existingUser.password);

        if (!isMatch) {
            let attempts = existingUser.failed_login_attempts + 1;

            if (attempts >= 5) {
                const lockTime = new Date(Date.now() + 15 * 60 * 1000);

                await db.query("UPDATE users SET failed_login_attempts = ?, lock_until = ? WHERE id = ?", [
                    attempts,
                    lockTime,
                    existingUser.id,
                ]);

                return res.status(403).json({
                    message: "Account locked for 15 minutes 🔒",
                });
            }

            await db.query("UPDATE users SET failed_login_attempts = ? WHERE id = ?", [attempts, existingUser.id]);

            return res.status(400).json({
                message: `Invalid password ❌ (${attempts}/5)`,
            });
        }

        // Reset attempts on success
        await db.query("UPDATE users SET failed_login_attempts = 0, lock_until = NULL WHERE id = ?", [existingUser.id]);

        const token = jwt.sign({id: existingUser.id, role: existingUser.role}, process.env.JWT_SECRET, {
            expiresIn: "1d",
        });

        res.status(200).json({
            message: "Login successful ✅",
            token,
            user: {
                id: existingUser.id,
                name: existingUser.name,
                role: existingUser.role,
            },
        });
    } catch (error) {
        console.error("Login Error:", error);

        res.status(500).json({
            message: "Server Error ❌",
        });
    }
};

// ==============================
// FORGOT PASSWORD
// ==============================

exports.forgotPassword = async (req, res) => {
    try {
        const {email} = req.body;

        const [user] = await db.query("SELECT id FROM users WHERE email = ? AND is_deleted = 0", [email]);

        if (user.length === 0) {
            return res.status(404).json({
                message: "User not found ❌",
            });
        }

        const resetToken = crypto.randomBytes(32).toString("hex");
        const expiry = new Date(Date.now() + 15 * 60 * 1000);

        await db.query("UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE email = ?", [
            resetToken,
            expiry,
            email,
        ]);

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const resetLink = `http://localhost:5173/reset-password/${resetToken}`;

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Password Reset Request",
            html: `
                <h3>Password Reset</h3>
                <p>Click the link below to reset your password:</p>
                <a href="${resetLink}">${resetLink}</a>
                <p>This link expires in 15 minutes.</p>
            `,
        });

        res.status(200).json({
            message: "Reset link sent to email 📧",
        });
    } catch (error) {
        console.error("Forgot Password Error:", error);

        res.status(500).json({
            message: "Server Error ❌",
        });
    }
};

// ==============================
// RESET PASSWORD
// ==============================

exports.resetPassword = async (req, res) => {
    try {
        const {token, newPassword} = req.body;

        const [user] = await db.query("SELECT id, reset_token_expiry FROM users WHERE reset_token = ?", [token]);

        if (user.length === 0) {
            return res.status(400).json({
                message: "Invalid token ❌",
            });
        }

        if (new Date() > new Date(user[0].reset_token_expiry)) {
            return res.status(400).json({
                message: "Token expired ⏰",
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await db.query(
            `UPDATE users 
             SET password = ?, reset_token = NULL, reset_token_expiry = NULL
             WHERE reset_token = ?`,
            [hashedPassword, token]
        );

        res.status(200).json({
            message: "Password reset successful 🔐",
        });
    } catch (error) {
        console.error("Reset Password Error:", error);

        res.status(500).json({
            message: "Server Error ❌",
        });
    }
};