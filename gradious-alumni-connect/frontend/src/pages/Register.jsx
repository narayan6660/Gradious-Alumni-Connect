

import {useState} from "react";
import {useNavigate} from "react-router-dom";
import API from "../services/api";

function Register() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        role: "alumni",
        course: "",
        college_name: "",
        batch: "",
        gender: "",
        address: "",
        working_status: "",
        company: "",
        position: "",
        linkedin_url: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setLoading(true);
        setError("");

        try {
            await API.post("/auth/register", formData);

            setSuccess("Registration successful! Redirecting to login...");

            setTimeout(() => {
                navigate("/login");
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-6">
            <div className="backdrop-blur-lg bg-white/20 border border-white/30 shadow-2xl p-10 rounded-2xl w-[700px]">
                <h2 className="text-3xl font-bold text-center text-white mb-8">Create Account</h2>

                {error && <p className="text-red-200 text-center mb-4">{error}</p>}

                {success && <p className="text-green-200 text-center mb-4">{success}</p>}

                <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                    {/* NAME */}

                    <input
                        type="text"
                        name="name"
                        placeholder="Full Name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="p-3 rounded-lg bg-white/80"
                    />

                    {/* EMAIL */}

                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="p-3 rounded-lg bg-white/80"
                    />

                    {/* PHONE */}

                    <input
                        type="text"
                        name="phone"
                        placeholder="Phone"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                        className="p-3 rounded-lg bg-white/80"
                    />

                    {/* PASSWORD */}

                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder="Password"
                            required
                            value={formData.password}
                            onChange={handleChange}
                            className="p-3 rounded-lg bg-white/80 w-full"
                        />

                        <span
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-3 cursor-pointer text-gray-600 text-sm"
                        >
                            {showPassword ? "Hide" : "Show"}
                        </span>
                    </div>

                    {/* ROLE */}
                    <input type="hidden" name="role" value="alumni" />

                    {/* COURSE */}

                    <input
                        name="course"
                        placeholder="Course"
                        value={formData.course}
                        onChange={handleChange}
                        className="p-3 rounded-lg bg-white/80"
                    />

                    {/* COLLEGE */}

                    <input
                        name="college_name"
                        placeholder="College Name"
                        value={formData.college_name}
                        onChange={handleChange}
                        className="p-3 rounded-lg bg-white/80"
                    />

                    {/* BATCH */}

                    <input
                        name="batch"
                        placeholder="Batch (e.g. 2025)"
                        value={formData.batch}
                        onChange={handleChange}
                        className="p-3 rounded-lg bg-white/80"
                    />

                    {/* GENDER */}

                    <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="p-3 rounded-lg bg-white/80"
                    >
                        <option value="">Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                    </select>

                    {/* WORKING STATUS */}

                    <select
                        name="working_status"
                        value={formData.working_status}
                        onChange={handleChange}
                        className="p-3 rounded-lg bg-white/80"
                    >
                        <option value="">Working Status</option>
                        <option value="working">Working</option>
                        <option value="not_working">Not Working</option>
                    </select>

                    {/* ADDRESS */}

                    <input
                        name="address"
                        placeholder="Address"
                        value={formData.address}
                        onChange={handleChange}
                        className="p-3 rounded-lg bg-white/80 col-span-2"
                    />

                    {/* COMPANY */}

                    <input
                        name="company"
                        placeholder="Company"
                        value={formData.company}
                        onChange={handleChange}
                        className="p-3 rounded-lg bg-white/80"
                    />

                    {/* POSITION */}

                    <input
                        name="position"
                        placeholder="Position"
                        value={formData.position}
                        onChange={handleChange}
                        className="p-3 rounded-lg bg-white/80"
                    />

                    {/* LINKEDIN */}

                    <input
                        name="linkedin_url"
                        placeholder="LinkedIn URL"
                        value={formData.linkedin_url}
                        onChange={handleChange}
                        className="p-3 rounded-lg bg-white/80 col-span-2"
                    />

                    {/* BUTTON */}

                    <button
                        type="submit"
                        disabled={loading}
                        className="col-span-2 bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
                    >
                        {loading ? "Registering..." : "Register"}
                    </button>
                </form>

                {/* LOGIN LINK */}

                <p className="text-center text-white mt-6 text-sm">
                    Already have an account?{" "}
                    <span onClick={() => navigate("/login")} className="cursor-pointer font-semibold underline">
                        Login
                    </span>
                </p>

                {/* BACK HOME */}

                <p
                    onClick={() => navigate("/")}
                    className="text-center text-white mt-3 cursor-pointer text-sm hover:underline"
                >
                    ← Back to Home
                </p>
            </div>
        </div>
    );
}

export default Register;