// import {useState} from "react";
// import {useNavigate} from "react-router-dom";
// import API from "../services/api";

// function Login() {
//     const navigate = useNavigate();

//     const [formData, setFormData] = useState({
//         email: "",
//         password: "",
//     });

//     const [showPassword, setShowPassword] = useState(false);
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState("");

//     const handleChange = (e) => {
//         setFormData({
//             ...formData,
//             [e.target.name]: e.target.value,
//         });
//     };

//     const handleLogin = async (e) => {
//         e.preventDefault();

//         setLoading(true);
//         setError("");

//         try {
//             const res = await API.post("/auth/login", formData);

//             const {token, user} = res.data;

//             localStorage.setItem("token", token);
//             localStorage.setItem("user", JSON.stringify(user));

//             if (user.role === "admin") {
//                 navigate("/admin/dashboard");
//             } else if (user.role === "student") {
//                 navigate("/student/dashboard");
//             } else if (user.role === "alumni") {
//                 navigate("/alumni/dashboard");
//             }
//         } catch (err) {
//             setError(err.response?.data?.message || "Login failed ❌");
//         }

//         setLoading(false);
//     };

//     return (
//         <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-100 to-blue-100">
//             <form onSubmit={handleLogin} className="bg-white p-10 rounded-2xl shadow-xl w-[420px]">
//                 <h1 className="text-3xl font-bold text-center text-indigo-600 mb-2">Gradious Alumni Connect</h1>

//                 <p className="text-center text-gray-500 mb-6">Login as Student • Alumni • Admin</p>

//                 {error && <div className="text-red-600 text-center mb-4 font-semibold">{error}</div>}

//                 <input
//                     type="email"
//                     name="email"
//                     placeholder="Email Address"
//                     required
//                     value={formData.email}
//                     onChange={handleChange}
//                     className="w-full p-3 mb-4 border rounded-lg focus:ring-2 focus:ring-indigo-400"
//                 />

//                 <div className="relative">
//                     <input
//                         type={showPassword ? "text" : "password"}
//                         name="password"
//                         placeholder="Password"
//                         required
//                         value={formData.password}
//                         onChange={handleChange}
//                         className="w-full p-3 mb-4 border rounded-lg focus:ring-2 focus:ring-indigo-400"
//                     />

//                     <span
//                         className="absolute right-3 top-3 text-sm text-gray-500 cursor-pointer"
//                         onClick={() => setShowPassword(!showPassword)}
//                     >
//                         {showPassword ? "Hide" : "Show"}
//                     </span>
//                 </div>

//                 <button
//                     type="submit"
//                     disabled={loading}
//                     className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold"
//                 >
//                     {loading ? "Logging in..." : "Login"}
//                 </button>

//                 <p className="text-center mt-4 text-sm">
//                     Don't have an account?{" "}
//                     <span
//                         onClick={() => navigate("/register")}
//                         className="text-indigo-600 cursor-pointer font-semibold"
//                     >
//                         Register
//                     </span>
//                 </p>
//             </form>
//         </div>
//     );
// }

// export default Login;

import {useState} from "react";
import {useNavigate} from "react-router-dom";
import API from "../services/api";

function Login() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await API.post("/auth/login", formData);

            const {token, user} = res.data;
console.log("LOGIN RESPONSE:", res.data);
console.log("USER:", user);
console.log("ROLE:", user?.role);
            sessionStorage.setItem("token", token);
          sessionStorage.setItem("user", JSON.stringify(user));

            if (user.role === "admin") {
                navigate("/admin/dashboard");
            } else if (user.role === "student") {
                navigate("/student/dashboard");
            } else if (user.role === "alumni") {
                navigate("/alumni/dashboard");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
            <div className="backdrop-blur-lg bg-white/20 border border-white/30 shadow-2xl p-10 rounded-2xl w-[420px]">
                <h2 className="text-3xl font-bold text-center text-white mb-8">Welcome Back</h2>

                {error && <p className="text-red-200 text-center mb-4">{error}</p>}

                <form onSubmit={handleLogin}>
                    {/* EMAIL */}

                    <div className="mb-5">
                        <label className="text-white text-sm mb-1 block">Email</label>

                        <input
                            type="email"
                            name="email"
                            placeholder="Enter your email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full p-3 rounded-lg bg-white/80 border border-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
                        />
                    </div>

                    {/* PASSWORD */}

                    <div className="mb-6">
                        <label className="text-white text-sm mb-1 block">Password</label>

                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="Enter your password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full p-3 rounded-lg bg-white/80 border border-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
                            />

                            <span
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-3 cursor-pointer text-gray-600 text-sm"
                            >
                                {showPassword ? "Hide" : "Show"}
                            </span>
                        </div>
                    </div>

                    {/* LOGIN BUTTON */}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>

                {/* REGISTER LINK */}

                <p className="text-center text-white mt-6 text-sm">
                    Don't have an account?{" "}
                    <span onClick={() => navigate("/register")} className="cursor-pointer font-semibold underline">
                        Register
                    </span>
                </p>

                {/* BACK HOME */}

                <p
                    onClick={() => navigate("/")}
                    className="text-center text-white mt-4 cursor-pointer text-sm hover:underline"
                >
                    ← Back to Home
                </p>
            </div>
        </div>
    );
}

export default Login;