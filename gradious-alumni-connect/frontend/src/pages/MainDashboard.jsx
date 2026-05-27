import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";

function MainDashboard() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem("user"));

        if (!storedUser) {
            navigate("/login");
            return;
        }

        setUser(storedUser);
    }, [navigate]);

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-100 p-10">
            <h1 className="text-3xl font-bold mb-6">Welcome, {user.name}</h1>

            <div className="grid md:grid-cols-3 gap-6">
                {user.role === "admin" && (
                    <div
                        onClick={() => navigate("/admin/dashboard")}
                        className="bg-white p-6 rounded-xl shadow hover:shadow-lg cursor-pointer"
                    >
                        <h2 className="text-xl font-semibold">Admin Panel</h2>
                        <p className="text-gray-500 mt-2">Manage users & platform</p>
                    </div>
                )}

                {user.role === "student" && (
                    <div
                        onClick={() => navigate("/student/dashboard")}
                        className="bg-white p-6 rounded-xl shadow hover:shadow-lg cursor-pointer"
                    >
                        <h2 className="text-xl font-semibold">Student Dashboard</h2>
                        <p className="text-gray-500 mt-2">Connect with alumni</p>
                    </div>
                )}

                {user.role === "alumni" && (
                    <div
                        onClick={() => navigate("/alumni/dashboard")}
                        className="bg-white p-6 rounded-xl shadow hover:shadow-lg cursor-pointer"
                    >
                        <h2 className="text-xl font-semibold">Alumni Dashboard</h2>
                        <p className="text-gray-500 mt-2">Manage connections</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default MainDashboard;
