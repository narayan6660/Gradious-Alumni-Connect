import {useNavigate} from "react-router-dom";

function LandingPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#0b1120] text-gray-200 overflow-hidden">
            {/* ===== BACKGROUND GLOW ===== */}
            <div className="absolute top-[-200px] right-[-200px] w-[500px] h-[500px] bg-blue-600 opacity-20 blur-[150px] rounded-full"></div>
            <div className="absolute bottom-[-200px] left-[-200px] w-[500px] h-[500px] bg-blue-500 opacity-20 blur-[150px] rounded-full"></div>

            {/* ===== NAVBAR ===== */}
            {/* ===== PREMIUM HEADER ===== */}
            <header className="fixed top-0 left-0 w-full z-50 bg-[#0b1120]/70 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-7xl mx-auto px-10 py-5 flex items-center justify-between">
                    {/* Brand */}
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
                        <div className="w-8 h-8 rounded-md bg-gradient-to-tr from-blue-500 to-blue-700 shadow-lg shadow-blue-500/30"></div>

                        <span className="text-lg font-semibold tracking-wide text-white">Gradious Alumni Connect</span>
                    </div>

                    {/* Center Links (optional but premium feel) */}
                    <nav className="hidden md:flex items-center gap-8 text-sm text-gray-400">
                        <span className="hover:text-white transition cursor-pointer">Platform</span>
                        <span className="hover:text-white transition cursor-pointer">Features</span>
                        <span className="hover:text-white transition cursor-pointer">Community</span>
                    </nav>

                    {/* Right Buttons */}
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => navigate("/login")}
                            className="text-gray-400 hover:text-white transition text-sm"
                        >
                            Login
                        </button>

                        <button
                            onClick={() => navigate("/register")}
                            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-md transition shadow-lg shadow-blue-500/20"
                        >
                            Get Started
                        </button>
                    </div>
                </div>
            </header>

            {/* ===== HERO ===== */}
            <div className="relative max-w-7xl mx-auto px-10 pt-44 pb-32 text-center">
                <h1 className="text-6xl md:text-7xl font-bold leading-tight text-white">
                    Connecting Students
                    <br />
                    <span className="text-blue-500">With Successful Alumni</span>
                </h1>

                <p className="mt-8 text-lg text-gray-400 max-w-2xl mx-auto">
                    A modern networking platform built to create structured, secure, and meaningful connections between
                    aspiring students and accomplished alumni.
                </p>

                <div className="mt-12 flex justify-center gap-6">
                    <button
                        onClick={() => navigate("/register")}
                        className="px-8 py-3 bg-blue-600 hover:bg-blue-500 rounded-md text-lg transition shadow-lg shadow-blue-500/30"
                    >
                        Create Account
                    </button>

                    <button
                        onClick={() => navigate("/login")}
                        className="px-8 py-3 border border-white/10 text-gray-300 rounded-md text-lg hover:border-blue-500 hover:text-white transition"
                    >
                        Login
                    </button>
                </div>

                {/* Feature Row */}
                <div className="mt-20 grid md:grid-cols-3 gap-8 text-left">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-sm hover:border-blue-500/50 transition">
                        <h3 className="text-white font-semibold text-lg">Verified Alumni Profiles</h3>
                        <p className="mt-3 text-gray-400 text-sm">Connect with trusted and authenticated alumni.</p>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-sm hover:border-blue-500/50 transition">
                        <h3 className="text-white font-semibold text-lg">Secure Role-Based Access</h3>
                        <p className="mt-3 text-gray-400 text-sm">Structured access control for students and alumni.</p>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-sm hover:border-blue-500/50 transition">
                        <h3 className="text-white font-semibold text-lg">Career Growth Network</h3>
                        <p className="mt-3 text-gray-400 text-sm">
                            Build connections that open professional opportunities.
                        </p>
                    </div>
                </div>
            </div>

            {/* ===== FOOTER ===== */}
            {/* ===== PREMIUM FOOTER ===== */}
            <footer className="border-t border-white/5 bg-[#0b1120] mt-20">
                <div className="max-w-7xl mx-auto px-10 py-16 grid md:grid-cols-3 gap-12 text-sm text-gray-400">
                    {/* Brand Section */}
                    <div>
                        <h3 className="text-white font-semibold text-lg mb-4">Gradious Alumni Connect</h3>
                        <p className="leading-relaxed">
                            A structured networking platform designed to bridge the gap between students and alumni.
                        </p>
                    </div>

                    {/* Links */}
                    <div>
                        <h4 className="text-white font-medium mb-4">Platform</h4>
                        <div className="space-y-2">
                            <div className="hover:text-white cursor-pointer transition">Features</div>
                            <div className="hover:text-white cursor-pointer transition">Security</div>
                            <div className="hover:text-white cursor-pointer transition">Community</div>
                        </div>
                    </div>

                    {/* Legal */}
                    <div>
                        <h4 className="text-white font-medium mb-4">Legal</h4>
                        <div className="space-y-2">
                            <div className="hover:text-white cursor-pointer transition">Privacy Policy</div>
                            <div className="hover:text-white cursor-pointer transition">Terms of Service</div>
                        </div>
                    </div>
                </div>

                {/* Bottom Line */}
                <div className="border-t border-white/5 text-center py-6 text-gray-500 text-xs">
                    © {new Date().getFullYear()} Gradious Alumni Connect. All rights reserved.
                </div>
            </footer>
        </div>
    );
}

export default LandingPage;
