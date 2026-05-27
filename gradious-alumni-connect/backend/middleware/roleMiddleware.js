
// This middleware checks if user role matches required role

exports.checkRole = (requiredRole) => {
    return (req, res, next) => {
        // 1️⃣ Get user role from decoded token
        const userRole = req.user.role;

        // 2️⃣ Check if role matches
        if (userRole !== requiredRole) {
            return res.status(403).json({
                message: "Access Denied. You do not have permission.",
            });
        }

        // 3️⃣ If role matches, continue
        next();
    };
};


