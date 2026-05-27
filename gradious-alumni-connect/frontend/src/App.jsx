
// import {BrowserRouter, Routes, Route, Navigate} from "react-router-dom";

// import Login from "./pages/Login";
// import Register from "./pages/Register";
// import Home from "./pages/Home";

// import AdminDashboard from "./pages/AdminDashboard";
// import AlumniDashboard from "./pages/AlumniDashboard";

// import TrashPage from "./pages/TrashPage";
// import AlumniManagement from "./pages/AlumniManagement";

// import AlumniProfile from "./pages/AlumniProfile";

// import AlumniProfileSelf from "./pages/AlumniProfileSelf";

// import PendingRequests from "./pages/PendingRequests";
// import MainDashboard from "./pages/MainDashboard";

// import ProtectedRoute from "./components/ProtectedRoute";
// import Chat from "./pages/Chat";
// import Messages from "./pages/Messages";
// import AlumniConnections from "./pages/AlumniConnections";

// import NetworkRequests from "./pages/NetworkRequests";
// import Network from "./pages/Network";
// import MyNetwork from "./pages/MyNetwork";

// import AdminUsers from "./pages/AdminUsers";
// import AdminMessages from "./pages/AdminMessages";

// function App() {
//     return (
//         <BrowserRouter>
//             <Routes>
//                 {/* PUBLIC */}

//                 <Route path="/" element={<Home />} />
//                 <Route path="/login" element={<Login />} />
//                 <Route path="/register" element={<Register />} />

//                 {/* ================= ADMIN ================= */}

//                 <Route
//                     path="/admin/dashboard"
//                     element={
//                         <ProtectedRoute allowedRoles={["admin"]}>
//                             <AdminDashboard />
//                         </ProtectedRoute>
//                     }
//                 />

//                 <Route
//                     path="/admin/trash"
//                     element={
//                         <ProtectedRoute allowedRoles={["admin"]}>
//                             <TrashPage />
//                         </ProtectedRoute>
//                     }
//                 />

//                 <Route
//                     path="/admin/alumni"
//                     element={
//                         <ProtectedRoute allowedRoles={["admin"]}>
//                             <AlumniManagement />
//                         </ProtectedRoute>
//                     }
//                 />

//                 {/* ================= ALUMNI DASHBOARD ================= */}

//                 <Route
//                     path="/alumni"
//                     element={
//                         <ProtectedRoute allowedRoles={["alumni"]}>
//                             <AlumniDashboard />
//                         </ProtectedRoute>
//                     }
//                 >
//                     <Route index element={<Navigate to="dashboard" />} />

//                     {/* IMPORTANT FIX */}
//                     <Route path="dashboard" element={<div />} />

//                     <Route path="requests" element={<PendingRequests />} />

//                     <Route path="connections" element={<AlumniConnections />} />

//                     <Route path="messages" element={<Messages />} />

//                     <Route path="chat/:userId" element={<Chat />} />

//                     <Route path="profile" element={<AlumniProfileSelf />} />
//                     <Route path="profile/:id" element={<AlumniProfile />} />

//                     {/* NETWORK */}

//                     <Route path="network" element={<Network />} />

//                     <Route path="network/requests" element={<NetworkRequests />} />

//                     <Route path="network/my" element={<MyNetwork />} />
//                 </Route>
//                 <Route
//                     path="/alumni/profile"
//                     element={
//                         <ProtectedRoute allowedRoles={["alumni"]}>
//                             <AlumniProfileSelf />
//                         </ProtectedRoute>
//                     }
//                 />
//                 {/* ================= COMMON ================= */}

//                 <Route
//                     path="/dashboard"
//                     element={
//                         <ProtectedRoute allowedRoles={["admin", "alumni"]}>
//                             <MainDashboard />
//                         </ProtectedRoute>
//                     }
//                 />

//                 {/* FALLBACK */}

//                 <Route path="*" element={<Navigate to="/" />} />
//                 <Route
//                     path="/admin/chat/:userId"
//                     element={
//                         <ProtectedRoute allowedRoles={["admin"]}>
//                             <Chat />
//                         </ProtectedRoute>
//                     }
//                 />
//                 <Route path="/admin/users" element={<AdminUsers />} />

//                 <Route path="/admin/messages" element={<AdminMessages />} />
//             </Routes>
//         </BrowserRouter>
//     );
// }

// export default App;
import {BrowserRouter, Routes, Route, Navigate} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";

import AdminDashboard from "./pages/AdminDashboard";
import AlumniDashboard from "./pages/AlumniDashboard";

import TrashPage from "./pages/TrashPage";
import AlumniManagement from "./pages/AlumniManagement";

import AlumniProfile from "./pages/AlumniProfile";
import AlumniProfileSelf from "./pages/AlumniProfileSelf";

import PendingRequests from "./pages/PendingRequests";
import MainDashboard from "./pages/MainDashboard";

import ProtectedRoute from "./components/ProtectedRoute";
import Chat from "./pages/Chat";
import Messages from "./pages/Messages";
import AlumniConnections from "./pages/AlumniConnections";

import NetworkRequests from "./pages/NetworkRequests";
import Network from "./pages/Network";
import MyNetwork from "./pages/MyNetwork";

import AdminUsers from "./pages/AdminUsers";
import AdminMessages from "./pages/AdminMessages";

function App() {
return ( <BrowserRouter> <Routes>
{/* PUBLIC */}
<Route path="/" element={<Home />} />
<Route path="/login" element={<Login />} />
<Route path="/register" element={<Register />} />


            {/* ================= ADMIN (FIXED ✅) ================= */}
            <Route
                path="/admin"
                element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                        <AdminDashboard />
                    </ProtectedRoute>
                }
            >
                <Route index element={<Navigate to="dashboard" />} />

                <Route path="dashboard" element={<div />} />
                <Route path="trash" element={<TrashPage />} />
                <Route path="alumni" element={<AlumniManagement />} />

                {/* 🔥 IMPORTANT */}
                <Route path="users" element={<AdminUsers />} />
                <Route path="messages" element={<AdminMessages />} />
                <Route path="chat/:userId" element={<Chat />} />
            </Route>

            {/* ================= ALUMNI ================= */}
            <Route
                path="/alumni"
                element={
                    <ProtectedRoute allowedRoles={["alumni"]}>
                        <AlumniDashboard />
                    </ProtectedRoute>
                }
            >
                <Route index element={<Navigate to="dashboard" />} />

                <Route path="dashboard" element={<div />} />
                <Route path="requests" element={<PendingRequests />} />
                <Route path="connections" element={<AlumniConnections />} />
                <Route path="messages" element={<Messages />} />
                <Route path="chat/:userId" element={<Chat />} />

                <Route path="profile" element={<AlumniProfileSelf />} />
                <Route path="profile/:id" element={<AlumniProfile />} />

                <Route path="network" element={<Network />} />
                <Route path="network/requests" element={<NetworkRequests />} />
                <Route path="network/my" element={<MyNetwork />} />
            </Route>

            <Route
                path="/alumni/profile"
                element={
                    <ProtectedRoute allowedRoles={["alumni"]}>
                        <AlumniProfileSelf />
                    </ProtectedRoute>
                }
            />

            {/* ================= COMMON ================= */}
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute allowedRoles={["admin", "alumni"]}>
                        <MainDashboard />
                    </ProtectedRoute>
                }
            />

            {/* FALLBACK */}
            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    </BrowserRouter>
);


}

export default App;
