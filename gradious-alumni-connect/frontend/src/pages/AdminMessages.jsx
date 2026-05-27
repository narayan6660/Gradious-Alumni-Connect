
import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import API from "../services/api";
import socket from "../services/socket";

function AdminMessages() {
    const navigate = useNavigate();

    const [connections, setConnections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [onlineUsers, setOnlineUsers] = useState([]);

    const storedUser = sessionStorage.getItem("user");
    const currentUser = storedUser ? JSON.parse(storedUser) : null;

    // if (!currentUser) {
    //     navigate("/login");
    //     return; // ⛔ IMPORTANT: stop further execution
    // }

    const role = currentUser?.role || "alumni";
    useEffect(() => {
        fetchConnections();

        if (currentUser?.id) {
            socket.emit("join", currentUser.id.toString());
        }

        const handleOnlineUsers = (users) => {
            setOnlineUsers(users);
        };

        const handleNewMessage = () => {
            fetchConnections(); // 🔥 update unread + last message
        };

        socket.on("online_users", handleOnlineUsers);
        socket.on("new_message", handleNewMessage);

        return () => {
            socket.off("online_users", handleOnlineUsers);
            socket.off("new_message", handleNewMessage);
        };
    }, [currentUser?.id]);

    const fetchConnections = async () => {
        try {
            const res = await API.get("/users/messages/users");
            setConnections(res.data.users || []);
        } catch (err) {
            console.error("Error loading chat users:", err);
        } finally {
            setTimeout(() => setLoading(false), 300);
        }
    };

    const highlightText = (text, query) => {
        if (!query || !text) return text;
        const parts = text.split(new RegExp(`(${query})`, "gi"));
        return parts.map((part, i) =>
            part.toLowerCase() === query.toLowerCase() ? (
                <span key={i} className="bg-yellow-200 px-0.5 rounded text-indigo-900 font-medium">
                    {part}
                </span>
            ) : (
                part
            )
        );
    };

    const filtered = connections.filter((u) => {
        const q = search.toLowerCase();
        return u.name?.toLowerCase().includes(q) || u.company?.toLowerCase().includes(q);
    });

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto p-4 space-y-4">
                {[1, 2, 3].map((_, i) => (
                    <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />
                ))}
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-4">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
                <p className="text-sm text-gray-500">Manage all conversations</p>
            </div>{" "}
            {/* SEARCH */}
            <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full mb-4 px-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
            />
            {/* 🔥 ADMIN SUPPORT (ADD HERE) */}
            {/* LIST */}
            <div className="space-y-3">
                {filtered.length === 0 ? (
                    <div className="text-center py-10">
                        <p className="text-gray-400 text-sm">No conversations yet</p>
                        <button
                            onClick={() => navigate("/alumni/network")}
                            className="mt-3 text-indigo-600 text-sm font-semibold"
                        >
                            Start connecting →
                        </button>
                    </div>
                ) : (
                    filtered.map((user) => {
                        const isOnline = onlineUsers.includes(user.id.toString());

                        return (
                            <div
                                key={user.id}
                                onClick={() => navigate(`/admin/chat/${user.id}`)}
                                className="flex items-center gap-4 p-4 bg-white rounded-xl shadow hover:shadow-md hover:scale-[1.01] transition-all cursor-pointer border border-gray-100"
                            >
                                {/* AVATAR */}
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold">
                                        {user.name.charAt(0)}
                                    </div>

                                    <div
                                        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                                            isOnline ? "bg-green-500" : "bg-gray-300"
                                        }`}
                                    />
                                </div>

                                {/* USER INFO */}
                                <div className="flex-1">
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-semibold text-gray-800">
                                            {highlightText(user.name, search)}
                                        </h3>

                                        <span className="text-[10px] text-gray-400">
                                            {user.lastMessageTime
                                                ? new Date(user.lastMessageTime).toLocaleTimeString([], {
                                                      hour: "2-digit",
                                                      minute: "2-digit",
                                                  })
                                                : ""}
                                        </span>
                                    </div>

                                    <p
                                        className={`text-sm truncate ${
                                            user.unreadCount > 0 ? "text-gray-900 font-semibold" : "text-gray-500"
                                        }`}
                                    >
                                        {user.lastMessage || "Start conversation"}
                                    </p>
                                </div>

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/admin/chat/${user.id}`);
                                    }}
                                    className="bg-indigo-600 text-white px-4 py-1 rounded-lg text-sm"
                                >
                                    Chat
                                </button>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

export default AdminMessages;
