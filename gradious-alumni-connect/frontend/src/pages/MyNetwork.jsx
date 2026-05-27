
// import {useEffect, useState} from "react";
// import {useNavigate} from "react-router-dom";
// import API from "../services/api";

// function MyNetwork() {
//     const navigate = useNavigate();

//     const [connections, setConnections] = useState([]);

//     useEffect(() => {
//         loadConnections();
//     }, []);

//     const loadConnections = async () => {
//         try {
//             const res = await API.get("/users/network/my");

//             setConnections(res.data.connections || []);
//         } catch (error) {
//             console.error(error);
//         }
//     };

//     return (
//         <div className="bg-white rounded-xl shadow-md p-6">
//             <h2 className="text-xl font-semibold mb-6">My Network</h2>

//             {connections.length === 0 ? (
//                 <p className="text-gray-500">No connections yet</p>
//             ) : (
//                 <div className="space-y-4">
//                     {connections.map((user) => (
//                         <div key={user.id} className="flex items-center justify-between border-b pb-4">
//                             <div className="flex items-center gap-3">
//                                 <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">
//                                     {user.name.charAt(0)}
//                                 </div>

//                                 <div>
//                                     <p className="font-medium">{user.name}</p>

//                                     <p className="text-sm text-gray-500">{user.company || user.course || user.role}</p>
//                                 </div>
//                             </div>

//                             <button
//                                 onClick={() => navigate(`/chat/${user.id}`)}
//                                 className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1 rounded-lg text-sm"
//                             >
//                                 Message
//                             </button>
//                         </div>
//                     ))}
//                 </div>
//             )}
//         </div>
//     );
// }

// export default MyNetwork;
import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import API from "../services/api";

function MyNetwork() {
    const navigate = useNavigate();

    const [connections, setConnections] = useState([]);

    const currentUser = JSON.parse(localStorage.getItem("user"));

    useEffect(() => {
        loadConnections();
    }, []);

    const loadConnections = async () => {
        try {
            const res = await API.get("/users/network/my");

            setConnections(res.data.connections || []);
        } catch (error) {
            console.error(error);
        }
    };

    const openChat = (userId) => {
        // detect role
        if (currentUser.role === "student") {
            navigate(`/student/chat/${userId}`);
        } else if (currentUser.role === "alumni") {
            navigate(`/alumni/chat/${userId}`);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-6">My Network</h2>

            {connections.length === 0 ? (
                <p className="text-gray-500">No connections yet</p>
            ) : (
                <div className="space-y-4">
                    {connections.map((user) => (
                        <div key={user.id} className="flex items-center justify-between border-b pb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">
                                    {user.name.charAt(0)}
                                </div>

                                <div>
                                    <p className="font-medium">{user.name}</p>

                                    <p className="text-sm text-gray-500">{user.company || user.course || user.role}</p>
                                </div>
                            </div>

                            <button
                                onClick={() => openChat(user.id)}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1 rounded-lg text-sm"
                            >
                                Message
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default MyNetwork;