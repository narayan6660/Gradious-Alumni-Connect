import {useNavigate, useLocation} from "react-router-dom";
import {useEffect, useRef, useState} from "react";

import API from "../services/api";

import {LayoutDashboard, Users, MessageCircle, Trash2, LogOut, Bell} from "lucide-react";

function DashboardLayout({children, role}) {
    const navigate = useNavigate();
    const location = useLocation(); // ✅ NEW

    const user = JSON.parse(sessionStorage.getItem("user"));
    const notificationRef = useRef(null);

    const [notifications, setNotifications] = useState([]);

    const [showNotifications, setShowNotifications] = useState(false);
    const handleLogout = () => {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");

        navigate("/login", {replace: true});
    };
useEffect(() => {
    const fetchNotifications = async () => {
        try {
            const res = await API.get("/users/admin/notifications");
            setNotifications(res.data.notifications || []);
        } catch (err) {
            console.error(err);
        }
    };

    fetchNotifications();
}, []);

useEffect(() => {
    const handleClickOutside = (event) => {
        if (notificationRef.current && !notificationRef.current.contains(event.target)) {
            setShowNotifications(false);
        }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
}, []);
const formatTime = (time) => {
    if (!time) return "Recent";

    const date = new Date(time);

    return (
        date.toLocaleDateString() +
        " • " +
        date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        })
    );
};

const handleBellClick = async () => {
    const opening = !showNotifications;

    setShowNotifications(opening);

    if (opening) {
        try {
           await API.put("/admin/notifications/read");

            setNotifications([]);
        } catch (err) {
            console.error(err);
        }
    }
};
    const menuItems = {
        admin: [
            {
                label: "Dashboard",
                path: "/admin/dashboard",
                icon: <LayoutDashboard size={20} />,
            },

            {
                label: "Alumni",
                path: "/admin/alumni",
                icon: <Users size={20} />,
            },

            {
                label: "Messages",
                path: "/admin/messages",
                icon: <MessageCircle size={20} />,
            },

            {
                label: "Trash",
                path: "/admin/trash",
                icon: <Trash2 size={20} />,
            },
        ],

        alumni: [
            {
                label: "Dashboard",
                path: "/alumni/dashboard",
                icon: <LayoutDashboard size={20} />,
            },
        ],
    };

    // ✅ ACTIVE CHECK
    const isActive = (path) => location.pathname.startsWith(path);
    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Sidebar */}
            <div
                className="
      w-72
      h-screen
      sticky top-0
    bg-gradient-to-b
from-[#4338CA]
via-[#5B21B6]
to-[#6D28D9]
      text-white
      flex flex-col
  border-r border-white/10
   shadow-2xl
   "
            >
                {" "}
                {/* Header */}
                <div className="px-8 py-8 border-b border-white/10">
                    <h2 className="text-2xl font-bold text-white">Gradious Alumni</h2>
                    <p className="text-sm text-indigo-100 mt-2 capitalize">{role} Panel</p>
                </div>
                {/* Menu */}
                <div className="flex-1 px-4 py-6 space-y-2">
                    {menuItems[role]?.map((item, index) => (
                        <button
                            key={index}
                            onClick={() => navigate(item.path)}
                            className={`
      w-full
      flex items-center gap-4
      px-5 py-4
      rounded-2xl
      transition-all duration-300

      ${
          isActive(item.path)
              ? "bg-white text-indigo-700 shadow-xl"
              : " text-white/80 hover:bg-white/15 hover:translate-x-1"
      }
   `}
                        >
                            {item.icon}

                            <span className="font-medium">{item.label}</span>
                        </button>
                    ))}
                </div>
                {/* Logout */}
                <div className="px-6 py-8 border-t border-white/10">
                    <button
                        onClick={handleLogout}
                        className="
      w-full
      flex items-center justify-center gap-3
    bg-white/10 hover:bg-red-500
      py-3 rounded-2xl
      transition-all duration-300
      font-medium
   "
                    >
                        <LogOut size={18} />
                        Logout
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 bg-[#F5F3FF] overflow-y-auto h-screen">
                <div className="sticky top-0 z-40 bg-[#F5F3FF]/80 backdrop-blur-xl border-b border-purple-100 px-10 py-5 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Welcome Back 👋</h1>

                        <p className="text-slate-500 mt-1">Manage your alumni platform professionally</p>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* NOTIFICATION */}
                        <div className="relative" ref={notificationRef}>
                            <button
                                onClick={handleBellClick}
                                className="
            w-11 h-11
            rounded-full
            bg-white
            border border-slate-200
            shadow-sm
            flex items-center justify-center
            hover:shadow-md
            transition-all duration-300
            relative
        "
                            >
                                <Bell size={18} className="text-slate-700" />
                                {notifications.some((n) => n.is_read === 0) && (
                                    <span className="absolute top-2 right-2 bg-rose-500 w-2 h-2 rounded-full border border-white animate-pulse"></span>
                                )}
                            </button>

                            {showNotifications && (
                                <div className="absolute right-0 top-14 w-80 bg-white shadow-xl rounded-xl z-[999] border border-slate-200 overflow-hidden">
                                    <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                                        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                            Alerts
                                        </h3>
                                    </div>

                                    <div className="max-h-72 overflow-y-auto">
                                        {notifications.length === 0 ? (
                                            <div className="p-6 text-center text-slate-400 text-sm">
                                                Clear skies! No alerts.
                                            </div>
                                        ) : (
                                            notifications.map((n, i) => (
                                                <div
                                                    key={i}
                                                    className="px-4 py-3 border-b border-slate-50 hover:bg-indigo-50/40 transition"
                                                >
                                                    <p className="text-sm font-medium text-slate-700">{n.message}</p>

                                                    <p className="text-[11px] text-slate-400 mt-1">
                                                        {formatTime(n.created_at)}
                                                    </p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="text-right">
                            <p className="font-semibold text-slate-800">{user?.name}</p>

                            <p className="text-sm text-slate-500 capitalize">{role}</p>
                        </div>

                        <div
                            className="
         w-12 h-12
         rounded-full
         bg-gradient-to-r
         from-indigo-500
         to-purple-500
         flex items-center justify-center
         text-white font-bold
      "
                        >
                            {user?.name?.charAt(0)}
                        </div>
                    </div>
                </div>

                <div className="p-8 lg:p-10">{children}</div>
            </div>
        </div>
    );
}

export default DashboardLayout;
