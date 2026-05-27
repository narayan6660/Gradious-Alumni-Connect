
import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import toast from "react-hot-toast";
import API from "../services/api";

function Network() {
    const [users, setUsers] = useState([]);
    const [mutuals, setMutuals] = useState({});
    const [loadingId, setLoadingId] = useState(null);
    const navigate = useNavigate();

    // ✅ 1. SAFE ROLE EXTRACTION (With Fallback)
   const role =  "alumni";

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await API.get("/users/network/users");
            const usersData = res.data.users || [];
            setUsers(usersData);
            usersData.forEach((user) => fetchMutuals(user.id));
        } catch (error) {
            console.error(error);
        }
    };

    const fetchMutuals = async (userId) => {
        try {
            const res = await API.get(`/users/network/mutual/${userId}`);
            setMutuals((prev) => ({
                ...prev,
                [userId]: res.data.mutuals.length,
            }));
        } catch {}
    };

    const connectUser = async (id) => {
        setLoadingId(id);
        try {
            const res = await API.post("/users/network/connect", {receiverId: id});
            toast.success(res.data.message || "Request sent ✅");
            fetchUsers();
        } catch (error) {
            toast.error("Connection failed ❌");
        } finally {
            setLoadingId(null);
        }
    };

    const acceptRequest = async (id) => {
        setLoadingId(id);
        try {
            await API.put("/users/network/accept", {senderId: id});
            toast.success("Accepted ✅");
            fetchUsers();
        } finally {
            setLoadingId(null);
        }
    };

    const rejectRequest = async (id) => {
        setLoadingId(id);
        try {
            await API.put("/users/network/reject", {senderId: id});
            toast.error("Rejected ❌");
            fetchUsers();
        } finally {
            setLoadingId(null);
        }
    };

    const cancelRequest = async (receiverId) => {
        setLoadingId(receiverId);
        try {
            await API.delete("/users/network/cancel", {
                data: {receiverId},
            });
            toast("Request cancelled ❌");
            fetchUsers();
        } finally {
            setLoadingId(null);
        }
    };

    const renderButton = (user) => {
        if (user.connectionStatus === "accepted") {
            return (
                <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                        Connected
                    </span>

                    {/* ✅ 2. FINAL MESSAGE BUTTON WITH DEBUG LOGS */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/${role}/chat/${user.id}`);
                        }}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1 rounded-full text-sm font-medium shadow-sm transition active:scale-95"
                    >
                        Message
                    </button>
                </div>
            );
        }

        if (user.connectionStatus === "sent") {
            return (
                <button
                    disabled={loadingId === user.id}
                    onClick={() => cancelRequest(user.id)}
                    className="bg-gray-500/80 hover:bg-gray-600 text-white px-4 py-1 rounded-full text-sm transition-all"
                >
                    {loadingId === user.id ? "..." : "Cancel"}
                </button>
            );
        }

        if (user.connectionStatus === "pending") {
            const id = user.sender_id || user.id;

            return (
                <div className="flex gap-2">
                    <button
                        disabled={loadingId === id}
                        onClick={() => acceptRequest(id)}
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg text-sm shadow-sm transition-all"
                    >
                        Accept
                    </button>

                    <button
                        disabled={loadingId === id}
                        onClick={() => rejectRequest(id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm shadow-sm transition-all"
                    >
                        Reject
                    </button>
                </div>
            );
        }

        return (
            <button
                disabled={loadingId === user.id}
                onClick={() => connectUser(user.id)}
                className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:opacity-90 text-white px-4 py-1 rounded-full text-sm shadow-md transition-all active:scale-95"
            >
                {loadingId === user.id ? "..." : "Connect"}
            </button>
        );
    };

    return (
        <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
            <div className="max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Discover Alumni</h2>

                {users.length === 0 ? (
                    <p className="text-center text-gray-400">No users found 😕</p>
                ) : (
                    <div className="space-y-4">
                        {users.map((user) => (
                            <div
                                key={user.id}
                                className="flex items-center justify-between p-4 rounded-xl backdrop-blur-md bg-white/70 border border-gray-200 shadow-sm hover:shadow-lg transition"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="flex flex-col items-center min-w-[65px]">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white flex items-center justify-center font-bold text-lg shadow">
                                            {user.name.charAt(0)}
                                        </div>

                                        <span className="mt-2 text-[10px] px-2 py-[1px] rounded-full font-bold uppercase tracking-wider border bg-purple-50 text-purple-700 border-purple-100">
                                            Alumni
                                        </span>
                                    </div>

                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-semibold text-gray-800">{user.name}</p>
                                            <span
                                                className={`text-[11px] px-2.5 py-[3px] rounded-full font-medium border ${
                                                    user.connectionStatus === "accepted"
                                                        ? "bg-green-50 text-green-700 border-green-200"
                                                        : user.connectionStatus === "pending"
                                                        ? "bg-amber-50 text-amber-700 border-amber-200"
                                                        : user.connectionStatus === "sent"
                                                        ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                                                        : "bg-gray-100 text-gray-600 border-gray-200"
                                                }`}
                                            >
                                                {user.connectionStatus || "new"}
                                            </span>
                                        </div>

                                        {mutuals[user.id] > 0 && (
                                            <p className="text-xs text-gray-500 font-medium">
                                                {mutuals[user.id]} mutual connections
                                            </p>
                                        )}

                                        <p className="text-sm text-gray-500 mt-1">{user.company || user.course}</p>
                                    </div>
                                </div>

                                <div className="flex items-center">{renderButton(user)}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Network;