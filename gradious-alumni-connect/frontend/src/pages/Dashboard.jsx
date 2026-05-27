// import {useNavigate} from "react-router-dom";
// import {useEffect, useState} from "react";
// function Dashboard() {
//     const navigate = useNavigate();
//     const [user, setUser] = useState(null);

//     useEffect(() => {
//       //  const token = localStorage.getItem("token");
//         const storedUser = localStorage.getItem("user");

      
//         if (storedUser) {
//             const parsedUser = JSON.parse(storedUser);

//             // 🚨 If not alumni → block access
//             if (parsedUser.role !== "alumni") {
//                 navigate("/login");
//                 return;
//             }

//             setUser(parsedUser);
//         }
//     }, [navigate]);

//     const handleLogout = () => {
//         localStorage.clear(); // safer
//         navigate("/login", {replace: true});
//     };

//     return (
//         <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
//             <h1 className="text-3xl font-bold mb-4">Welcome, {user?.name} 🎉</h1>

//             <p className="mb-6 text-lg">
//                 Role: <span className="font-semibold">{user?.role}</span>
//             </p>

//             <button
//                 onClick={handleLogout}
//                 className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
//             >
//                 Logout
//             </button>
//         </div>
//     );
// }

// export default Dashboard;