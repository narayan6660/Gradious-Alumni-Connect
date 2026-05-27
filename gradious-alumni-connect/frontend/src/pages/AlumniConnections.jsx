
import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import API from "../services/api";
import {useLocation} from "react-router-dom";
function AlumniConnections() {
    const navigate = useNavigate();
const location = useLocation();

    const [connections, setConnections] = useState([]);
    const [loading, setLoading] = useState(true);

  useEffect(() => {
      fetchConnections();
  }, [location.pathname]);

    const fetchConnections = async () => {
        try {
            const res = await API.get("/users/network/my");
            setConnections(res.data.connections || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64">Loading connections...</div>;
    }

    return (
        <div className="max-w-5xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">My Connections</h1>

            {connections.length === 0 ? (
                <div className="bg-white p-8 rounded-xl shadow text-gray-500 text-center">No connections yet</div>
            ) : (
                <div className="bg-white rounded-xl shadow divide-y">
                    {connections.map((user, index) => (
                        <div
                            key={`${user.id}-${index}`}
                            className="flex items-center justify-between p-4 hover:bg-gray-50 transition"
                        >
                            <div
                                className="flex items-center gap-4 cursor-pointer"
                                onClick={() => navigate(`/alumni/profile/${user.id}`)}
                            >
                                <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">
                                    {user.name ? user.name.charAt(0).toUpperCase() : "?"}
                                </div>

                                <div>
                                    <p className="font-semibold hover:text-indigo-600">{user.name}</p>

                                    <p className="text-sm text-gray-500">
                                        {user.course || "N/A"} • {user.batch || "N/A"}
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => navigate(`/alumni/profile/${user.id}`)}
                                    className="bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm"
                                >
                                    View Profile
                                </button>

                                {user.connectionStatus === "accepted" ? (
                                    <button
                                        onClick={() => navigate(`/alumni/chat/${user.id}`)}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm"
                                    >
                                        Message
                                    </button>
                                ) : (
                                    <button
                                        disabled
                                        className="bg-gray-200 text-gray-400 px-4 py-2 rounded-lg text-sm cursor-not-allowed"
                                    >
                                        Connect to chat
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default AlumniConnections;