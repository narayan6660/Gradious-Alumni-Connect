// import {useEffect, useState} from "react";
// import {useNavigate} from "react-router-dom";
// import API from "../services/api";
// import socket from "../services/socket"; // Ensure you have a shared socket instance
// import {useParams} from "react-router-dom";

// function Messages() {
//     const navigate = useNavigate();
//     const [connections, setConnections] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [search, setSearch] = useState("");
//     const [onlineUsers, setOnlineUsers] = useState([]);

//     const currentUser = JSON.parse(localStorage.getItem("user"));
//     const role = currentUser?.role;

//     useEffect(() => {
//         fetchConnections();

//         // FIX 1 & PRO IMPROVEMENT: Join with String + Proper Cleanup
//         if (currentUser?.id) {
//             socket.emit("join", currentUser.id.toString());
//         }

//         const handleOnlineUsers = (users) => {
//             setOnlineUsers(users);
//         };

//         socket.on("online_users", handleOnlineUsers);

//         return () => {
//             socket.off("online_users", handleOnlineUsers);
//         };
//     }, [currentUser?.id]);

//     const fetchConnections = async () => {
//         try {
//             const res = await API.get("/users/messages/users");
//             setConnections(res.data.users || []);
//         } catch (err) {
//             console.error("Error loading chat users:", err);
//         } finally {
//             setTimeout(() => setLoading(false), 500);
//         }
//     };

//     const highlightText = (text, query) => {
//         if (!query || !text) return text;
//         const parts = text.split(new RegExp(`(${query})`, "gi"));
//         return parts.map((part, i) =>
//             part.toLowerCase() === query.toLowerCase() ? (
//                 <span key={i} className="bg-yellow-200 px-0.5 rounded text-indigo-900 font-medium">
//                     {part}
//                 </span>
//             ) : (
//                 part
//             )
//         );
//     };

//     // FIX 2: SEARCH NOW INCLUDES COMPANY
//     const filtered = connections.filter((u) => {
//         const q = search.toLowerCase();
//         return (
//             u.name?.toLowerCase().includes(q) ||
//             u.role?.toLowerCase().includes(q) ||
//             u.company?.toLowerCase().includes(q)
//         );
//     });

//     if (loading) {
//         return (
//             <div className="max-w-4xl mx-auto p-4 space-y-4">
//                 {[1, 2, 3].map((_, i) => (
//                     <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />
//                 ))}
//             </div>
//         );
//     }

//     return (
//         <div className="max-w-4xl mx-auto p-4 animate-in fade-in duration-500">
//             <div className="flex justify-between items-end mb-6">
//                 <div>
//                     <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Messages</h1>
//                     <p className="text-gray-500 text-sm">Real-time networking</p>
//                 </div>
//             </div>
//             <div className="flex gap-2 mb-4">
//                 <button
//                     onClick={() => setSearch("student")}
//                     className="px-4 py-1 rounded-full text-xs font-semibold bg-gray-200 hover:bg-gray-300 transition"
//                 >
//                     Students
//                 </button>

//                 <button
//                     onClick={() => setSearch("alumni")}
//                     className="px-4 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition"
//                 >
//                     Alumni
//                 </button>

//                 <button
//                     onClick={() => setSearch("")}
//                     className="px-4 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-600 hover:bg-red-200 transition"
//                 >
//                     Reset
//                 </button>
//             </div>
//             <div className="relative mb-6">
//                 <input
//                     type="text"
//                     placeholder="Search name, role, or company..."
//                     value={search}
//                     onChange={(e) => setSearch(e.target.value)}
//                     className="w-full border-none bg-white px-5 py-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm text-gray-700"
//                 />
//             </div>

//             <div className="space-y-3">
//                 {filtered.map((user) => {
//                     const isOnline = onlineUsers.includes(user.id.toString());
//                     return (
//                         <div
//                             key={user.id}
//                             className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm hover:shadow-md hover:scale-[1.01] transition-all cursor-pointer group border border-transparent hover:border-indigo-100"
//                             onClick={() => navigate(`/${role}/chat/${user.id}`)}
//                         >
//                             <div className="relative">
//                                 <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl shadow-inner">
//                                     {user.name.charAt(0)}
//                                 </div>
//                                 <div
//                                     className={`absolute bottom-0 right-0 w-4 h-4 border-4 border-white rounded-full ${
//                                         isOnline ? "bg-green-500" : "bg-gray-300"
//                                     }`}
//                                 />
//                             </div>

//                             <div className="flex-1">
//                                 <div className="flex items-center gap-2">
//                                     <h3 className="font-bold text-gray-800">{highlightText(user.name, search)}</h3>
//                                     {isOnline && (
//                                         <span className="text-[10px] text-green-600 font-bold uppercase tracking-widest bg-green-50 px-1.5 py-0.5 rounded">
//                                             Online
//                                         </span>
//                                     )}
//                                 </div>
//                                 <p className="text-xs text-gray-500 font-medium">
//                                     {highlightText(user.company || "Alumni", search)} •{" "}
//                                     {highlightText(user.role, search)}
//                                 </p>
//                             </div>

//                             <button
//                                 onClick={(e) => {
//                                     e.stopPropagation();
//                                     navigate(`/${role}/chat/${user.id}`);
//                                 }}
//                                 className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold"
//                             >
//                                 Chat
//                             </button>
//                         </div>
//                     );
//                 })}
//             </div>
//         </div>
//     );
// }

// export default Messages;
import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import API from "../services/api";
import socket from "../services/socket";

function Messages() {
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
            <h1 className="text-2xl font-bold mb-4">Chats</h1>
            {/* SEARCH */}
            <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full mb-4 px-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
            />
            {/* 🔥 ADMIN SUPPORT (ADD HERE) */}
            <div className="mb-4">
                <p className="text-xs font-bold text-gray-400 uppercase mb-2">Admin Support</p>

                <div
                    onClick={() => navigate(`/alumni/chat/1`)}
                    className="flex items-center gap-4 p-4 bg-indigo-50 border border-indigo-100 rounded-xl cursor-pointer hover:bg-indigo-100 transition"
                >
                    <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">
                        A
                    </div>

                    <div className="flex-1">
                        <h3 className="font-semibold text-indigo-700">Admin</h3>
                        <p className="text-sm text-gray-500">Support & Help</p>
                    </div>

                    <span className="text-xs bg-indigo-600 text-white px-2 py-1 rounded">💬</span>
                </div>
            </div>
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
                                onClick={() => navigate(`/${role}/chat/${user.id}`)}
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
                                        navigate(`/${role}/chat/${user.id}`);
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

export default Messages;
