

import {Navigate} from "react-router-dom";

function ProtectedRoute({children, allowedRoles}) {
    const token = sessionStorage.getItem("token");
   const storedUser = sessionStorage.getItem("user");

    // 🚨 If token OR user missing
    console.log("TOKEN:", token);
    console.log("STORED USER:", storedUser);
    if (!token || !storedUser) {
        return <Navigate to="/login" replace />;
    }

   let user;
   try {
       user = JSON.parse(storedUser);
       console.log("PARSED USER:", user);
       console.log("ROLE:", user?.role);
       console.log("ALLOWED ROLES:", allowedRoles);
   } catch (error) {
       sessionStorage.removeItem("token");
       sessionStorage.removeItem("user");

       return <Navigate to="/login" replace />;
   }
    // 🚨 If role not allowed
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

export default ProtectedRoute;