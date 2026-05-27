import {useEffect, useState, useRef} from "react";
import {useNavigate, Outlet, useLocation} from "react-router-dom";
import API from "../services/api";
import socket from "../services/socket";
import {LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer} from "recharts";
import {Legend} from "recharts";
import {motion} from "framer-motion";
function AlumniDashboard() {
    const ADMIN_ID = 1;
    const navigate = useNavigate();
    const location = useLocation();

    const [user, setUser] = useState(null);
    const [stats, setStats] = useState({
        pendingRequests: 0,
        connections: 0,
        messages: 0,
    });

    const [connections, setConnections] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [activity, setActivity] = useState([]);
    const [onlineUsersCount, setOnlineUsersCount] = useState(0); // 🔥 New: Online tracking
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [notifications, setNotifications] = useState({
        pendingRequests: 0,
        unreadMessages: 0,
        messageNotifications: [],
        requestNotifications: [],
    });

    const [toast, setToast] = useState(null);
    const [showNotifications, setShowNotifications] = useState(false);
    const notificationRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [chartData, setChartData] = useState([]);
    const showToast = (message) => {
        setToast(message);
        setTimeout(() => setToast(null), 3000);
    };

    const getTitle = () => {
        if (location.pathname.includes("dashboard")) return "Dashboard Overview";
        if (location.pathname.includes("network")) return "Network Directory";
        if (location.pathname.includes("messages")) return "Messages";
        if (location.pathname.includes("requests")) return "Connection Requests";
        if (location.pathname.includes("connections")) return "My Connections";
        return "Alumni Portal";
    };

    useEffect(() => {
        const updateUser = () => {
            const storedUser = JSON.parse(sessionStorage.getItem("user"));

            if (!storedUser || storedUser.role !== "alumni") {
                navigate("/login");
                return;
            }

            setUser(storedUser);
        };

        updateUser(); // first load

        window.addEventListener("storage", updateUser); // 🔥 listen changes

        loadDashboard();

        return () => {
            window.removeEventListener("storage", updateUser);
        };
    }, []);

    useEffect(() => {
        if (user?.id) {
            socket.emit("join", user.id.toString());
        }

        socket.on("new_connection_request", (data) => {
            setStats((prev) => ({...prev, pendingRequests: prev.pendingRequests + 1}));
            setNotifications((prev) => ({
                ...prev,
                pendingRequests: prev.pendingRequests + 1,
                requestNotifications: [{name: data.name, ...data}, ...prev.requestNotifications],
            }));

            setActivity((prev) => [{type: "request", name: data.name, time: "just now"}, ...prev].slice(0, 5));
            showToast(`${data.name} sent you a connection request!`);
        });

        socket.on("new_message", (data) => {
            // ❌ IGNORE OWN MESSAGES
            if (data.sender_id === user?.id) return;

            setStats((prev) => ({...prev, messages: prev.messages + 1}));

            setNotifications((prev) => ({
                ...prev,
                unreadMessages: prev.unreadMessages + 1,
                messageNotifications: [data, ...prev.messageNotifications],
            }));

            setActivity((prev) => [{type: "message", name: data.sender_name, time: "just now"}, ...prev].slice(0, 5));

            showToast(`New message from ${data.sender_name}`);
        });

        // 🔥 Real-time Online Users Listener
        socket.on("online_users_count", (count) => {
            setOnlineUsersCount(count);
        });
        socket.on("online_users", (users) => {
            setOnlineUsers(users);
        });
        return () => {
            socket.off("new_connection_request");
            socket.off("new_message");
            socket.off("online_users_count");
            socket.off("online_users");
        };
    }, [user]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const loadDashboard = async () => {
        try {
            const [statsRes, networkRes, notificationRes, usersRes, analyticsRes, activityRes] = await Promise.all([
                API.get("/users/alumni/dashboard"),
                API.get("/users/network/my"),
                API.get("/users/notifications"),
                API.get("/users/network/users"),
                API.get("/users/alumni/analytics"),
                API.get("/users/alumni/activity"), // 🔥 NEW
            ]);

            setStats(statsRes.data);
            const connectionsData = networkRes.data.connections || [];
            setConnections(connectionsData);
            setNotifications(notificationRes.data);
            setAllUsers(usersRes.data.users || []);

            // const activities = [];
            // connectionsData.slice(0, 3).forEach((u) => {
            //     activities.push({type: "connection", name: u.name, time: "Recent"});
            // });
            // notificationRes.data.requestNotifications?.forEach((req) => {
            //     activities.push({type: "request", name: req.name, time: "Pending"});
            // });
            setActivity(activityRes.data.activity || []);
            // 🔥 Generate dynamic chart data from real data
            // 🔥 REAL ANALYTICS DATA
            const formattedChart = (analyticsRes.data.chartData || []).map((item) => ({
                name: new Date(item.day).toLocaleDateString("en-US", {weekday: "short"}),
                connections: item.connections,
                messages: item.messages,
            }));

            setChartData(formattedChart);
        } catch (error) {
            console.error("Error loading dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleConnect = async (userId) => {
        try {
            const selectedUser = allUsers.find((u) => u.id === userId);

            // ❌ prevent admin
            if (selectedUser?.role === "admin") {
                showToast("Cannot connect to admin ❌");
                return;
            }

            // UI update
            setAllUsers((prev) => prev.map((u) => (u.id === userId ? {...u, requested: true} : u)));

            // ✅ ONLY ONE API CALL
            await API.post("/users/network/connect", {
                receiverId: userId,
            });

            showToast("Connection request sent 🚀");

            await loadDashboard(); // sync UI
        } catch (error) {
            console.error("Error sending request:", error);

            // rollback UI
            setAllUsers((prev) => prev.map((u) => (u.id === userId ? {...u, requested: false} : u)));

            showToast(error.response?.data?.message || "Failed to send request.");
        }
    };
    const handleAccept = async (senderId) => {
        try {
            await API.put("/users/network/accept", {senderId});

            showToast("Connection accepted ✅");

            await loadDashboard(); // refresh UI
        } catch (error) {
            console.error(error);
            showToast("Failed to accept ❌");
        }
    };

    const handleReject = async (senderId) => {
        try {
            await API.put("/users/network/reject", {senderId});

            showToast("Request rejected ❌");

            await loadDashboard(); // refresh UI
        } catch (error) {
            console.error(error);
            showToast("Failed to reject ❌");
        }
    };
    const handleLogout = () => {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");

        navigate("/login");
    };

    const isActive = (path) => location.pathname.startsWith(path);
    const firstName = user?.name?.split(" ")[0];

    // Simple profile completion logic
    const fields = [user?.name, user?.company, user?.position, user?.address, user?.bio, user?.linkedin_url];

    const filled = fields.filter((f) => f && f !== "").length;

    const profileCompletion = Math.round((filled / fields.length) * 100);

    // const suggestedUsers = allUsers
    // .filter((u) => u.connectionStatus !== "accepted") // Only show people with no history
    // .slice(0, 4);

    const suggestedUsers = allUsers
    .filter((u) => u.id !== user?.id)
    .filter((u) => u.role !== "admin")
    .filter((u) => u.connectionStatus !== "accepted")
    .slice(0, 4);
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="w-10 h-10 border-4 border-[#4338ca] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex bg-gray-50 font-sans tracking-tight relative">
            {toast && (
                <div className="fixed top-6 right-6 bg-[#4338ca] text-white px-5 py-3 rounded-xl shadow-2xl z-[100] animate-bounce flex items-center gap-3 border border-indigo-400">
                    <span className="text-lg">✨</span>
                    <span className="text-sm font-bold">{toast}</span>
                </div>
            )}

            {/* SIDEBAR */}
            <div className="w-64 h-screen sticky top-0 bg-[#4338ca] text-white flex flex-col shadow-lg z-20">
                <div className="px-6 py-8">
                    <h2 className="text-xl font-bold">Gradious Connect</h2>
                    <p className="text-[11px] text-indigo-200 uppercase tracking-widest font-semibold mt-1">
                        Alumni Panel
                    </p>
                </div>

                <div className="flex-1 px-3 space-y-1">
                    {[
                        {name: "Dashboard", path: "/alumni/dashboard", icon: "🏠"},
                        {name: "Requests", path: "/alumni/requests", icon: "📩"},
                        {name: "My Network", path: "/alumni/connections", icon: "👥"},
                        {name: "Network", path: "/alumni/network", icon: "🌐"},
                        {name: "Messages", path: "/alumni/messages", icon: "💬"},
                    ].map((item) => (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center gap-3 text-sm font-medium ${
                                isActive(item.path)
                                    ? "bg-white text-indigo-700 shadow-md"
                                    : "text-indigo-100 hover:bg-white/10"
                            }`}
                        >
                            <span className="text-base">{item.icon}</span>
                            {item.name}
                        </button>
                    ))}
                </div>

                <div className="p-4">
                    <button
                        onClick={handleLogout}
                        className="w-full bg-[#ef4444] hover:bg-red-600 text-white py-2.5 rounded-lg text-sm font-bold transition-all shadow-md"
                    >
                        Logout
                    </button>
                </div>
            </div>

            {/* MAIN CONTENT */}
            <div className="flex-1 p-6 lg:p-10 overflow-y-auto space-y-6">
                {" "}
                <div className="flex justify-between items-center bg-white border border-gray-100 px-6 py-4 rounded-2xl mb-8 shadow">
                    <div className="flex items-center gap-4">
                        <h1 className="text-lg font-bold text-gray-800">{getTitle()}</h1>
                        {/* 🔥 New: Online Status Indicator */}
                        <div className="flex items-center gap-1.5 bg-green-50 px-2 py-1 rounded-md border border-green-100">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            <span className="text-[10px] font-bold text-green-700 uppercase">
                                {onlineUsersCount} Online
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-5">
                        <div className="relative" ref={notificationRef}>
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="p-2 rounded-full hover:bg-gray-100 relative transition-colors"
                            >
                                <span className="text-xl">🔔</span>
                                {notifications.pendingRequests + notifications.unreadMessages > 0 && (
                                    <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full border border-white font-bold animate-pulse">
                                        {notifications.pendingRequests + notifications.unreadMessages}
                                    </span>
                                )}
                            </button>
                            {showNotifications && (
                                <div className="absolute right-0 mt-3 w-80 bg-white shadow-xl rounded-xl border border-gray-200 overflow-hidden z-50">
                                    <div className="px-4 py-2 bg-gray-50 border-b flex justify-between items-center">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase">
                                            Notifications
                                        </span>
                                        <button className="text-[10px] text-indigo-600 font-bold hover:underline">
                                            Mark all read
                                        </button>
                                    </div>
                                    <div className="max-h-64 overflow-y-auto">
                                        {[...notifications.requestNotifications, ...notifications.messageNotifications]
                                            .length === 0 ? (
                                            <p className="p-4 text-center text-sm text-gray-400">No new alerts</p>
                                        ) : (
                                            <>
                                                {notifications.requestNotifications.map((req, i) => (
                                                    <div
                                                        key={`req-${i}`}
                                                        className="p-4 hover:bg-gray-50 border-b last:border-0 cursor-pointer"
                                                        onClick={() => {
                                                            navigate("/alumni/requests");
                                                            setShowNotifications(false);
                                                        }}
                                                    >
                                                        <p className="text-xs text-gray-700">
                                                            📥 <b>{req.name}</b> wants to connect
                                                        </p>
                                                    </div>
                                                ))}
                                                {notifications.messageNotifications.map((msg, i) => (
                                                    <div
                                                        key={`msg-${i}`}
                                                        className="p-4 hover:bg-gray-50 border-b last:border-0 cursor-pointer"
                                                        onClick={() => {
                                                            navigate("/alumni/messages");
                                                            setShowNotifications(false);
                                                        }}
                                                    >
                                                        <p className="text-xs text-gray-700">
                                                            💬 New message from <b>{msg.sender_name}</b>
                                                        </p>
                                                    </div>
                                                ))}
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div
                            onClick={() => navigate(`/alumni/profile/${user.id}`)}
                            className="flex items-center gap-3 cursor-pointer bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200 hover:border-indigo-300 transition-all"
                        >
                            <div className="w-8 h-8 bg-[#4338ca] text-white rounded-lg flex items-center justify-center font-bold text-sm">
                                {user?.name?.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm font-bold text-gray-700">{firstName}</span>
                        </div>
                    </div>
                </div>
                {location.pathname === "/alumni/dashboard" ? (
                    <motion.div initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}} transition={{duration: 0.5}}>
                        <div className="grid lg:grid-cols-3 gap-6 mb-8">
                            {/* LEFT HERO CARD */}

                            <div className="lg:col-span-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white p-6 rounded-2xl shadow-lg flex justify-between items-center">
                                <div>
                                    <h2 className="text-2xl font-bold">Welcome back, {firstName} 👋</h2>
                                    <p className="text-sm text-indigo-200 mt-1">Grow your network and stay connected</p>
                                    <button
                                        onClick={() => navigate(`/alumni/chat/${ADMIN_ID}`)}
                                        className="mt-4 bg-white text-indigo-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-50 transition"
                                    >
                                        Contact Admin 💬
                                    </button>
                                </div>

                                <div className="flex gap-6 text-center">
                                    <div>
                                        <p className="text-xs text-indigo-200">Connections</p>
                                        <p className="text-xl font-bold">{stats.connections}</p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-indigo-200">Messages</p>
                                        <p className="text-xl font-bold">{stats.messages}</p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-indigo-200">Requests</p>
                                        <p className="text-xl font-bold">{stats.pendingRequests}</p>
                                    </div>
                                </div>
                            </div>

                            {/* PROFILE COMPLETION */}

                            <div className="bg-white p-5 rounded-2xl shadow border border-gray-100 hover:shadow-md transition">
                                <p className="text-xs text-gray-500">Profile Completion</p>

                                <p className="text-2xl font-bold text-indigo-600">{profileCompletion}%</p>

                                <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                                    <div
                                        className="bg-indigo-600 h-2 rounded-full"
                                        style={{width: `${profileCompletion}%`}}
                                    />
                                </div>

                                <button
                                    onClick={() => navigate("/alumni/profile")}
                                    className="text-xs text-indigo-600 font-semibold mt-3 hover:underline"
                                >
                                    Complete Profile →
                                </button>
                            </div>
                        </div>

                        {/* STAT CARDS */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            {[
                                {
                                    label: "Pending Requests",
                                    val: stats.pendingRequests,
                                    color: "text-indigo-600",
                                    bg: "bg-indigo-50",
                                },
                                {
                                    val: stats.connections, // keep value
                                    label: "Connections",
                                    color: "text-green-600",
                                    bg: "bg-green-50",
                                },

                                {
                                    label: "Unread Messages",
                                    val: stats.messages,
                                    color: "text-[#ef4444]",
                                    bg: "bg-red-50",
                                },
                            ].map((s, i) => (
                                <motion.div
                                    key={i}
                                    initial={{opacity: 0, y: 30}}
                                    animate={{opacity: 1, y: 0}}
                                    transition={{delay: i * 0.1}}
                                    className="bg-white p-6 rounded-2xl shadow hover:shadow-lg hover:scale-[1.02] transition-all border border-gray-100"
                                >
                                    <div className="flex justify-between items-start">
                                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                                            {s.label}
                                        </p>
                                        <div className={`p-3 rounded-xl ${s.bg} text-sm shadow-inner`}>📊</div>{" "}
                                    </div>
                                    <h3 className={`text-3xl font-bold mt-2 ${s.color}`}>{s.val}</h3>
                                </motion.div>
                            ))}
                        </div>
                        {/* 🔥 ANALYTICS SECTION */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow mb-8">
                            {" "}
                            <h3 className="text-lg font-bold text-indigo-700 mb-4"> 📊 Activity Analytics</h3>
                            <div className="h-[250px] min-h-[250px] w-full">
                                {chartData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={250}>
                                        <LineChart data={chartData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Line
                                                type="monotone"
                                                dataKey="connections"
                                                stroke="#4338ca"
                                                strokeWidth={2}
                                            />
                                            <Line type="monotone" dataKey="messages" stroke="#ef4444" strokeWidth={2} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                                        No data available
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 🔥 MINI ANALYTICS CARDS */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 mb-8">
                            <div className="bg-white p-4 rounded-xl shadow border border-gray-100 text-center">
                                <p className="text-xs text-gray-500">Weekly Growth</p>
                                <p className="text-lg font-bold text-indigo-600"> {connections.length}</p>
                            </div>

                            <div className="bg-white p-4 rounded-xl shadow border border-gray-100 text-center">
                                <p className="text-xs text-gray-500">Active Chats</p>
                                <p className="text-lg font-bold text-green-600">{stats.messages}</p>
                            </div>

                            <div className="bg-white p-4 rounded-xl shadow border border-gray-100 text-center">
                                <p className="text-xs text-gray-500">New Requests</p>
                                <p className="text-lg font-bold text-red-500">{stats.pendingRequests}</p>
                            </div>

                            <div className="bg-white p-4 rounded-xl shadow border border-gray-100 text-center">
                                <p className="text-xs text-gray-500">Response Rate</p>
                                <p className="text-lg font-bold text-yellow-600">
                                    {Math.min(100, Math.floor((stats.messages / (connections.length || 1)) * 100))}%
                                </p>
                            </div>
                        </div>
                        <div className="grid lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 space-y-6">
                                {/* ACTIVITY FEED */}
                                <div className="bg-white rounded-2xl border border-gray-100 shadow p-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-base font-bold text-gray-800">Recent Activity</h3>
                                        <button className="text-[10px] font-bold text-indigo-600 uppercase hover:underline">
                                            View History
                                        </button>
                                    </div>
                                    <div className="space-y-4">
                                        {activity.length === 0 ? (
                                            <div className="text-center py-10">
                                                <p className="text-gray-400 text-sm italic">
                                                    🚀 No activity yet. Start connecting!
                                                </p>
                                            </div>
                                        ) : (
                                            activity.map((item, index) => (
                                                <motion.div
                                                    key={index}
                                                    initial={{opacity: 0, x: -20}}
                                                    animate={{opacity: 1, x: 0}}
                                                    transition={{delay: index * 0.1}}
                                                    className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition"
                                                >
                                                    <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-sm">
                                                        {item.type === "connection" && "🤝"}
                                                        {item.type === "request" && "📥"}
                                                        {item.type === "message" && "💬"}
                                                    </div>
                                                    <p className="text-sm text-gray-700 flex-1">
                                                        <span className="font-bold text-gray-900">{item.name}</span>
                                                        {item.type === "connection" && " connected with you"}
                                                        {item.type === "request" && " sent you a request"}
                                                        {item.type === "message" && " messaged you"}
                                                    </p>
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase">
                                                        {new Date(item.time).toLocaleString()}
                                                    </span>
                                                </motion.div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                {/* SUGGESTED CONNECTIONS */}
                                <div className="bg-white rounded-2xl border border-gray-100 shadow p-6">
                                    <h3 className="text-base font-bold text-gray-800 mb-4 flex justify-between items-center">
                                        Suggested Connections
                                        <button
                                            onClick={() => navigate("/alumni/network")}
                                            className="text-[10px] text-indigo-600 font-bold uppercase hover:underline"
                                        >
                                            See All
                                        </button>
                                    </h3>

                                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {suggestedUsers.length === 0 ? (
                                            <p className="text-xs text-gray-400 italic">
                                                No new suggestions at the moment.
                                            </p>
                                        ) : (
                                            suggestedUsers.map((u, i) => (
                                                <div
                                                    key={u.id}
                                                    className="bg-white p-5 rounded-2xl shadow hover:shadow-xl hover:scale-[1.02] transition text-center border border-gray-100"
                                                >
                                                    <div className="flex flex-col items-center">
                                                        {/* AVATAR */}
                                                        <div className="w-14 h-14 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white flex items-center justify-center text-lg font-bold">
                                                            {u.name.charAt(0)}
                                                        </div>

                                                        {/* NAME */}
                                                        <h3
                                                            className="mt-3 font-semibold text-gray-800 cursor-pointer hover:text-indigo-600"
                                                            onClick={() => navigate(`/alumni/profile/${u.id}`)}
                                                        >
                                                            {u.name}
                                                        </h3>

                                                        {/* ROLE */}
                                                        <p className="text-xs text-gray-400">Alumni</p>

                                                        {/* ACTION BUTTONS */}
                                                        <div className="mt-4 flex gap-2 flex-wrap justify-center">
                                                            {(!u.connectionStatus || u.connectionStatus === "none") && (
                                                                <button
                                                                    onClick={() => handleConnect(u.id)}
                                                                    className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:scale-105 transition"
                                                                >
                                                                    Connect
                                                                </button>
                                                            )}

                                                            {u.connectionStatus === "sent" && (
                                                                <span className="text-xs bg-yellow-100 text-yellow-700 px-3 py-1 rounded-lg">
                                                                    Requested
                                                                </span>
                                                            )}

                                                            {u.connectionStatus === "received" && (
                                                                <>
                                                                    <button
                                                                        onClick={() => handleAccept(u.id)}
                                                                        className="bg-green-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold"
                                                                    >
                                                                        Accept
                                                                    </button>

                                                                    <button
                                                                        onClick={() => handleReject(u.id)}
                                                                        className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold"
                                                                    >
                                                                        Reject
                                                                    </button>
                                                                </>
                                                            )}

                                                            {u.connectionStatus === "accepted" && (
                                                                <>
                                                                    <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-lg">
                                                                        Connected
                                                                    </span>

                                                                    <button
                                                                        onClick={() => navigate(`/alumni/chat/${u.id}`)}
                                                                        className="bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-indigo-700"
                                                                    >
                                                                        Message
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* RIGHT SIDEBAR TOOLS */}
                            <div className="space-y-6">
                                <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl p-6 text-white shadow-lg relative overflow-hidden group">
                                    <div className="absolute -right-4 -bottom-4 text-white/10 text-6xl rotate-12 group-hover:rotate-0 transition-all duration-500">
                                        🤝
                                    </div>
                                    <h4 className="font-bold text-lg mb-2 z-10 relative">Mentorship</h4>
                                    <p className="text-xs text-indigo-100 leading-relaxed mb-6 z-10 relative">
                                        Building connections increases your visibility in the alumni network.
                                    </p>
                                    <button
                                        onClick={() => navigate("/alumni/network")}
                                        className="w-full bg-white text-indigo-700 py-2.5 rounded-lg text-xs font-bold hover:bg-indigo-50 transition-colors z-10 relative shadow-md"
                                    >
                                        Discover Alumni
                                    </button>
                                </div>

                                <div className="bg-white rounded-2xl border border-gray-100 shadow p-6">
                                    {" "}
                                    <h3 className="text-base font-bold text-indigo-700 mb-4"> My Network</h3>
                                    <div className="space-y-4">
                                        {connections.length === 0 ? (
                                            <p className="text-[11px] text-gray-400 italic">No connections yet.</p>
                                        ) : (
                                            connections.slice(0, 4).map((c, i) => (
                                                <div
                                                    key={i}
                                                    className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition cursor-pointer group"
                                                    onClick={() => navigate("/alumni/connections")}
                                                >
                                                    {/* ✅ USER INFO (ADD THIS) */}
                                                    <div className="flex items-center gap-3">
                                                        {/* AVATAR */}
                                                        <div className="w-9 h-9 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white flex items-center justify-center text-sm font-bold">
                                                            {c.name.charAt(0)}
                                                        </div>

                                                        {/* NAME */}
                                                        <div>
                                                            <p className="text-sm font-semibold text-gray-800">
                                                                {c.name}
                                                            </p>
                                                            <p className="text-xs text-gray-400">
                                                                {c.company || "Alumni"}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* 🔥 CHAT BUTTON */}
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate(`/alumni/chat/${c.id}`);
                                                        }}
                                                        className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-all hover:bg-indigo-100"
                                                    >
                                                        Chat
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <Outlet />
                )}
            </div>
        </div>
    );
}

export default AlumniDashboard;
