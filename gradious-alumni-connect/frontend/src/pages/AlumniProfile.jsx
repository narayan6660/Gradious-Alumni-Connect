import {useEffect, useState} from "react";
import {useParams, useNavigate} from "react-router-dom";
import API from "../services/api";

function AlumniProfile() {
    const {id} = useParams();
    const navigate = useNavigate();

    const [alumni, setAlumni] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAlumni();
    }, [id]);

    const fetchAlumni = async () => {
        try {
            const res = await API.get(`/users/profile/${id}`);

            setAlumni(res.data.user);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center text-lg">Loading profile...</div>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-blue-100 to-purple-100 p-8 flex justify-center items-start">
            <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden">
                {/* HEADER */}

                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white relative">
                    <button onClick={() => navigate(-1)} className="absolute left-6 top-6 text-white hover:underline">
                        ← Back
                    </button>

                    <div className="flex items-center gap-6 mt-4">
                        <div className="w-20 h-20 rounded-full bg-white text-indigo-600 flex items-center justify-center text-3xl font-bold shadow-lg">
                            {alumni.name.charAt(0).toUpperCase()}
                        </div>

                        <div>
                            <h1 className="text-3xl font-bold">{alumni.name}</h1>

                            <p className="text-indigo-200">Alumni Mentor</p>
                        </div>
                    </div>
                </div>

                {/* INFO SECTION */}

                <div className="p-8 grid md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-xl p-5 shadow-sm">
                        <h3 className="font-semibold text-gray-700 mb-2">🎓 College</h3>

                        <p className="text-gray-600">{alumni.college_name || "Not Provided"}</p>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-5 shadow-sm">
                        <h3 className="font-semibold text-gray-700 mb-2">📚 Course</h3>

                        <p className="text-gray-600">{alumni.course || "Not Provided"}</p>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-5 shadow-sm">
                        <h3 className="font-semibold text-gray-700 mb-2">🎓 Batch</h3>

                        <p className="text-gray-600">{alumni.batch || "Not Provided"}</p>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-5 shadow-sm">
                        <h3 className="font-semibold text-gray-700 mb-2">🏢 Company</h3>

                        <p className="text-gray-600">{alumni.company || "Not Provided"}</p>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-5 shadow-sm md:col-span-2">
                        <h3 className="font-semibold text-gray-700 mb-2">💼 Position</h3>

                        <p className="text-gray-600">{alumni.position || "Not Provided"}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-5 shadow-sm md:col-span-2">
                        <h3 className="font-semibold text-gray-700 mb-2">📍 Address</h3>
                        <p className="text-gray-600">{alumni.address || "Not Provided"}</p>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-5 shadow-sm md:col-span-2">
                        <h3 className="font-semibold text-gray-700 mb-2">🧑 About</h3>
                        <p className="text-gray-600">{alumni.bio || "No bio available"}</p>
                    </div>
                </div>

                {/* ACTION BUTTONS */}

                <div className="flex flex-wrap gap-4 justify-center pb-8">
                    {/* Chat */}

                    <button
                        onClick={() => navigate(`/alumni/chat/${alumni.id}`)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl shadow-md transition"
                    >
                        Message
                    </button>

                    {/* Email */}

                    <a
                        href={`mailto:${alumni.email}`}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl shadow-md transition"
                    >
                        Email Alumni
                    </a>

                    {/* LinkedIn */}

                    {alumni.linkedin_url && (
                        <a
                            href={alumni.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl shadow-md transition"
                        >
                            LinkedIn
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AlumniProfile;

