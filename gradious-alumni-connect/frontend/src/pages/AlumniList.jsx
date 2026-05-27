
import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import API from "../services/api";

function AlumniList() {
    const navigate = useNavigate();

    const [alumni, setAlumni] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
const [connections, setConnections] = useState([]);
    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem("user"));

        if (!storedUser || storedUser.role !== "student") {
            navigate("/login");
            return;
        }

        fetchAlumni();
    }, [navigate]);

  const fetchAlumni = async () => {
      try {
          const [alumniRes, connectionsRes] = await Promise.all([
              API.get("/users/alumni"),
              API.get("/users/network/my"),
          ]);

          setAlumni(alumniRes.data.alumni || []);
          setConnections(connectionsRes.data.connections || []);
      } catch (err) {
          console.error("Fetch Alumni Error:", err.response?.data || err.message);
      } finally {
          setLoading(false);
      }
  };
const isConnected = (id) => {
    return connections.some((c) => c.id === id);
};
    const handleConnect = async (alumniId) => {
        try {
            const res = await API.post("/users/connect", {alumniId});

            alert(res.data.message);

            setAlumni((prev) =>
                prev.map((person) => (person.id === alumniId ? {...person, connection_status: "pending"} : person))
            );
        } catch (err) {
            alert(err.response?.data?.message || "Connection failed ❌");
        }
    };

    const filteredAlumni = alumni.filter(
        (person) =>
            person.name?.toLowerCase().includes(search.toLowerCase()) ||
            (person.company && person.company.toLowerCase().includes(search.toLowerCase()))
    );

    if (loading) {
        return <div className="p-10 text-center">Loading alumni...</div>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 py-12 px-8">
            <div className="max-w-7xl mx-auto">
                {/* TITLE */}

                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Alumni Network</h1>

                    <p className="text-gray-500 mt-1 text-sm">{alumni.length} alumni available</p>
                </div>

                {/* SEARCH */}

                <input
                    type="text"
                    placeholder="Search alumni by name or company..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full mb-4 border border-gray-300 px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                />

                {/* RESULT COUNT */}

                {search && (
                    <p className="text-sm text-gray-500 mb-8">
                        {filteredAlumni.length} result
                        {filteredAlumni.length !== 1 && "s"} found
                    </p>
                )}

                {filteredAlumni.length === 0 ? (
                    <div className="text-center text-gray-500 mt-20">
                        <p className="text-lg">No alumni found.</p>
                        <p className="text-sm mt-2">Try searching with another name.</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-3 gap-8">
                        {filteredAlumni.map((person) => (
                            <div
                                key={person.id}
                                className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition"
                            >
                                {/* HEADER */}

                                <div className="flex items-center gap-4 mb-4">
                                    {/* AVATAR FIX */}

                                    <div className="w-12 h-12 shrink-0 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-lg">
                                        {person?.name ? person.name.charAt(0).toUpperCase() : "A"}
                                    </div>

                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-800">{person.name}</h2>

                                        <p className="text-sm text-gray-500">{person.email}</p>
                                    </div>
                                </div>

                                {/* COMPANY */}

                                {(person.company || person.position) && (
                                    <div className="text-sm text-gray-600 mb-3">
                                        {person.position && <p>{person.position}</p>}

                                        {person.company && <p className="font-medium">{person.company}</p>}
                                    </div>
                                )}

                                {/* LINKEDIN */}

                                {person.linkedin_url && (
                                    <a
                                        href={person.linkedin_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block mt-3 text-center bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition"
                                    >
                                        View LinkedIn
                                    </a>
                                )}

                                {/* CONNECT */}

                                {isConnected(person.id) ? (
                                    <button
                                        disabled
                                        className="mt-3 w-full bg-green-500 text-white py-2 rounded-lg cursor-not-allowed"
                                    >
                                        Connected ✅
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleConnect(person.id)}
                                        className="mt-3 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg transition"
                                    >
                                        Send Request
                                    </button>
                                )}

                                {/* MESSAGE */}

                                {isConnected(person.id) && (
                                    <button
                                        onClick={() => navigate(`/student/chat/${person.id}`)}
                                        className="mt-3 w-full bg-green-700 hover:bg-green-800 text-white py-2 rounded-lg transition"
                                    >
                                        Message
                                    </button>
                                )}

                                {/* PROFILE */}

                                <button
                                    onClick={() => navigate(`/student/alumni/${person.id}`)}
                                    className="mt-3 w-full bg-gray-800 hover:bg-gray-900 text-white py-2 rounded-lg transition"
                                >
                                    View Profile
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default AlumniList;