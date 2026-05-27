
// import {useEffect, useState} from "react";
// import API from "../services/api";
// import toast from "react-hot-toast";

// function NetworkRequests() {
//     const [requests, setRequests] = useState([]);

//     useEffect(() => {
//         loadRequests();
//     }, []);

//     const loadRequests = async () => {
//         try {
//             const res = await API.get("/users/network/requests");
//             setRequests(res.data.requests || []);
//         } catch (error) {
//             console.error(error);
//             toast.error("Failed to load requests ❌");
//         }
//     };

//     // ✅ ACCEPT
//     const acceptRequest = async (senderId) => {
//         try {
//             await API.put("/users/network/accept", {
//                 senderId,
//             });

//             toast.success("Connection accepted ✅");

//             // remove from UI instantly
//             setRequests((prev) => prev.filter((r) => r.id !== senderId));
//         } catch (error) {
//             console.error(error);
//             toast.error("Accept failed ❌");
//         }
//     };

//     // ❌ REJECT
//     const rejectRequest = async (senderId) => {
//         try {
//             await API.put("/users/network/reject", {
//                 senderId,
//             });

//             toast.error("Request rejected ❌");

//             // remove from UI instantly
//             setRequests((prev) => prev.filter((r) => r.id !== senderId));
//         } catch (error) {
//             console.error(error);
//             toast.error("Reject failed ❌");
//         }
//     };

//     return (
//         <div className="max-w-4xl mx-auto p-10">
//             <h2 className="text-2xl font-bold mb-6">Pending Connection Requests</h2>

//             {requests.length === 0 ? (
//                 <p className="text-gray-500">No pending requests</p>
//             ) : (
//                 <div className="space-y-4">
//                     {requests.map((user) => (
//                         <div
//                             key={user.id}
//                             className="flex items-center justify-between bg-white shadow-md p-4 rounded-xl hover:shadow-lg transition"
//                         >
//                             <div>
//                                 <p className="font-semibold">{user.name}</p>
//                                 <p className="text-sm text-gray-500">{user.email}</p>
//                             </div>

//                             <div className="flex gap-2">
//                                 <button
//                                     onClick={() => acceptRequest(user.id)}
//                                     className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
//                                 >
//                                     Accept
//                                 </button>

//                                 <button
//                                     onClick={() => rejectRequest(user.id)}
//                                     className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
//                                 >
//                                     Reject
//                                 </button>
//                             </div>
//                         </div>
//                     ))}
//                 </div>
//             )}
//         </div>
//     );
// }

// export default NetworkRequests;
import {useEffect, useState} from "react";
import API from "../services/api";
import toast from "react-hot-toast";

function NetworkRequests() {
    const [requests, setRequests] = useState([]);
    const [loadingId, setLoadingId] = useState(null); // 🔥 track button loading
    const [loading, setLoading] = useState(true); // 🔥 page loading

    useEffect(() => {
        loadRequests();
    }, []);

    const loadRequests = async () => {
        try {
            setLoading(true);
            const res = await API.get("/users/network/requests");
            setRequests(res.data.requests || []);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load requests ❌");
        } finally {
            setLoading(false);
        }
    };

    // ✅ ACCEPT
    const acceptRequest = async (senderId) => {
        try {
            setLoadingId(senderId);

            await API.put("/users/network/accept", {senderId});

            toast.success("Connection accepted 🤝");

            // remove from UI instantly
            setRequests((prev) => prev.filter((r) => r.id !== senderId));
        } catch (error) {
            console.error(error);
            toast.error("Accept failed ❌");
        } finally {
            setLoadingId(null);
        }
    };

    // ❌ REJECT
    const rejectRequest = async (senderId) => {
        try {
            setLoadingId(senderId);

            await API.put("/users/network/reject", {senderId});

            toast("Request rejected ❌");

            setRequests((prev) => prev.filter((r) => r.id !== senderId));
        } catch (error) {
            console.error(error);
            toast.error("Reject failed ❌");
        } finally {
            setLoadingId(null);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-10">
            <h2 className="text-2xl font-bold mb-6">Pending Connection Requests</h2>

            {/* 🔄 PAGE LOADING */}
            {loading ? (
                <div className="flex justify-center py-10">
                    <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : requests.length === 0 ? (
                <p className="text-gray-500 text-center">🚀 No pending requests</p>
            ) : (
                <div className="space-y-4">
                    {requests.map((user) => (
                        <div
                            key={user.id}
                            className="flex items-center justify-between bg-white shadow-md p-4 rounded-xl hover:shadow-lg transition"
                        >
                            {/* USER INFO */}
                            <div>
                                <p className="font-semibold text-gray-800">{user.name}</p>
                                <p className="text-sm text-gray-500">{user.email}</p>
                            </div>

                            {/* ACTION BUTTONS */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => acceptRequest(user.id)}
                                    disabled={loadingId === user.id}
                                    className={`px-4 py-2 rounded-lg text-white font-semibold transition ${
                                        loadingId === user.id
                                            ? "bg-green-300 cursor-not-allowed"
                                            : "bg-green-600 hover:bg-green-700"
                                    }`}
                                >
                                    {loadingId === user.id ? "Processing..." : "Accept"}
                                </button>

                                <button
                                    onClick={() => rejectRequest(user.id)}
                                    disabled={loadingId === user.id}
                                    className={`px-4 py-2 rounded-lg text-white font-semibold transition ${
                                        loadingId === user.id
                                            ? "bg-red-300 cursor-not-allowed"
                                            : "bg-red-600 hover:bg-red-700"
                                    }`}
                                >
                                    {loadingId === user.id ? "Processing..." : "Reject"}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default NetworkRequests;