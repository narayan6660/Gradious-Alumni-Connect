import {useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";
import API from "../services/api";
import logo from "../assets/logo.png";

function Home() {
    const navigate = useNavigate();

    const [stats, setStats] = useState({
        totalStudents: 0,
        totalAlumni: 0,
        totalConnections: 0,
    });

    const [featuredAlumni, setFeaturedAlumni] = useState([]);
    const [loading, setLoading] = useState(true);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        fetchStats();
        fetchFeaturedAlumni();

        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const fetchStats = async () => {
        try {
            const res = await API.get("/users/platform-stats");

            setStats({
                totalStudents: res.data.totalStudents || 0,
                totalAlumni: res.data.totalAlumni || 0,
                totalConnections: res.data.totalConnections || 0,
            });
        } catch (error) {
            console.error("Stats error:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchFeaturedAlumni = async () => {
        try {
            const res = await API.get("/users/featured-alumni");
            setFeaturedAlumni(res.data);
        } catch (error) {
            console.error("Featured alumni error:", error);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
            {/* NAVBAR */}

            <nav
                className={`flex justify-between items-center px-12 py-5 sticky top-0 z-50 backdrop-blur-md transition
                ${scrolled ? "bg-white shadow-md" : "bg-white/70"}`}
            >
                <div onClick={() => navigate("/")} className="flex items-center gap-3 cursor-pointer">
                    <div className="bg-white p-2 rounded-lg shadow-md">
                        <img src={logo} alt="Gradious Logo" className="w-8 h-8 object-contain" />
                    </div>

                    <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                        Gradious Alumni Connect
                    </h1>
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={() => navigate("/login")}
                        className="px-5 py-2 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition"
                    >
                        Login
                    </button>

                    <button
                        onClick={() => navigate("/register")}
                        className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-md"
                    >
                        Register
                    </button>
                </div>
            </nav>

            {/* HERO */}

            {/* HERO */}

            <section
                className="
   relative overflow-hidden
   flex flex-col items-center
   text-center
   px-6 py-36
   bg-gradient-to-br
   from-slate-950
   via-indigo-950
   to-slate-900
   text-white
"
            >
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-20 left-20 w-72 h-72 bg-indigo-500 rounded-full blur-3xl"></div>

                    <div className="absolute bottom-10 right-10 w-72 h-72 bg-purple-500 rounded-full blur-3xl"></div>
                </div>

                <div className="relative z-10">
                    <h2
                        className="
         text-6xl md:text-7xl
         font-extrabold
         leading-tight
         mb-8
      "
                    >
                        Build Meaningful
                        <span className="text-indigo-400"> Alumni </span>
                        Connections
                    </h2>

                    <p className="text-slate-300 text-xl max-w-3xl mb-12 leading-relaxed">
                        Connect with alumni professionals, grow your network, discover mentorship opportunities, and
                        build lasting industry relationships.
                    </p>

                    <div className="flex gap-5 justify-center">
                        <button
                            onClick={() => navigate("/register")}
                            className="
               bg-indigo-600
               hover:bg-indigo-700
               text-white
               px-8 py-4
               rounded-2xl
               font-semibold
               shadow-xl
               transition-all duration-300
               hover:scale-105
            "
                        >
                            Get Started
                        </button>

                        <button
                            onClick={() => navigate("/login")}
                            className="
               border border-slate-500
               bg-white/10
               backdrop-blur-md
               text-white
               px-8 py-4
               rounded-2xl
               hover:bg-white/20
               transition-all duration-300
            "
                        >
                            Login
                        </button>
                    </div>
                </div>
            </section>

            {/* PLATFORM STATS */}

            <section className="py-24 bg-slate-50">
                <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 px-6">
                    <div
                        className="
            bg-white
            rounded-3xl
            p-10
            border border-slate-200
            shadow-sm
            hover:shadow-2xl
            transition-all duration-300
            hover:-translate-y-2
         "
                    >
                        <h3 className="text-5xl font-bold text-indigo-600">{loading ? "..." : stats.totalAlumni}</h3>

                        <p className="text-slate-600 mt-4 font-medium text-lg">Active Alumni</p>
                    </div>

                    <div
                        className="
            bg-white
            rounded-3xl
            p-10
            border border-slate-200
            shadow-sm
            hover:shadow-2xl
            transition-all duration-300
            hover:-translate-y-2
         "
                    >
                        <h3 className="text-5xl font-bold text-purple-600">
                            {loading ? "..." : stats.totalConnections}
                        </h3>

                        <p className="text-slate-600 mt-4 font-medium text-lg">Professional Connections</p>
                    </div>

                    <div
                        className="
            bg-white
            rounded-3xl
            p-10
            border border-slate-200
            shadow-sm
            hover:shadow-2xl
            transition-all duration-300
            hover:-translate-y-2
         "
                    >
                        <h3 className="text-5xl font-bold text-pink-600">24/7</h3>

                        <p className="text-slate-600 mt-4 font-medium text-lg">Alumni Support</p>
                    </div>
                </div>
            </section>

            {/* FEATURED ALUMNI */}

            <section className="py-28 bg-slate-50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-20">
                        <h3 className="text-5xl font-bold text-slate-900 mb-6">Featured Alumni Professionals</h3>

                        <p className="text-slate-500 text-xl max-w-3xl mx-auto">
                            Connect with experienced alumni working in top companies across multiple industries.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-10">
                        {featuredAlumni.length === 0 ? (
                            <p className="text-center col-span-3 text-slate-500">No alumni available</p>
                        ) : (
                            featuredAlumni.map((alumni) => (
                                <div
                                    key={alumni.id}
                                    className="
                     group
                     bg-white
                     border border-slate-200
                     rounded-3xl
                     p-10
                     hover:shadow-2xl
                     transition-all duration-300
                     hover:-translate-y-2
                     text-center
                  "
                                >
                                    <div
                                        className="
                        w-24 h-24
                        mx-auto mb-6
                        rounded-full
                        bg-gradient-to-r
                        from-indigo-600
                        to-purple-600
                        flex items-center justify-center
                        text-white
                        text-3xl
                        font-bold
                     "
                                    >
                                        {alumni.name.charAt(0)}
                                    </div>

                                    <h4 className="text-2xl font-bold text-slate-900">{alumni.name}</h4>

                                    <div
                                        className="
                        inline-flex
                        items-center
                        px-4 py-2
                        mt-4
                        rounded-full
                        bg-indigo-50
                        text-indigo-700
                        font-medium
                     "
                                    >
                                        {alumni.position || "Professional Alumni"}
                                    </div>

                                    <p className="text-slate-500 mt-5 text-lg">
                                        {alumni.company || "Top Industry Professional"}
                                    </p>

                                    <button
                                        className="
                        mt-8
                        bg-slate-900
                        hover:bg-indigo-600
                        text-white
                        px-6 py-3
                        rounded-2xl
                        transition-all duration-300
                     "
                                    >
                                        View Profile
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </section>

            {/* FEATURES */}

            {/* FEATURED ALUMNI */}

            {/* FEATURES */}

            <section className="py-28 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-20">
                        <h3 className="text-5xl font-bold text-slate-900 mb-6">Powerful Alumni Networking</h3>

                        <p className="text-slate-500 text-xl max-w-3xl mx-auto">
                            Build meaningful professional relationships, receive mentorship, and grow your alumni
                            network.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-10">
                        {/* CARD 1 */}
                        <div
                            className="
               bg-slate-50
               border border-slate-200
               rounded-3xl
               p-10
               hover:shadow-2xl
               transition-all duration-300
               hover:-translate-y-2
            "
                        >
                            <div
                                className="
               w-16 h-16
               rounded-2xl
               bg-indigo-100
               flex items-center justify-center
               text-3xl mb-8
            "
                            >
                                🌐
                            </div>

                            <h4 className="text-2xl font-bold text-slate-900 mb-4">Alumni Discovery</h4>

                            <p className="text-slate-600 leading-relaxed">
                                Discover alumni professionals working in top companies across multiple industries.
                            </p>
                        </div>

                        {/* CARD 2 */}
                        <div
                            className="
               bg-slate-50
               border border-slate-200
               rounded-3xl
               p-10
               hover:shadow-2xl
               transition-all duration-300
               hover:-translate-y-2
            "
                        >
                            <div
                                className="
               w-16 h-16
               rounded-2xl
               bg-purple-100
               flex items-center justify-center
               text-3xl mb-8
            "
                            >
                                🎯
                            </div>

                            <h4 className="text-2xl font-bold text-slate-900 mb-4">Career Mentorship</h4>

                            <p className="text-slate-600 leading-relaxed">
                                Get career guidance and industry insights from experienced alumni mentors.
                            </p>
                        </div>

                        {/* CARD 3 */}
                        <div
                            className="
               bg-slate-50
               border border-slate-200
               rounded-3xl
               p-10
               hover:shadow-2xl
               transition-all duration-300
               hover:-translate-y-2
            "
                        >
                            <div
                                className="
               w-16 h-16
               rounded-2xl
               bg-pink-100
               flex items-center justify-center
               text-3xl mb-8
            "
                            >
                                💬
                            </div>

                            <h4 className="text-2xl font-bold text-slate-900 mb-4">Real-time Messaging</h4>

                            <p className="text-slate-600 leading-relaxed">
                                Chat instantly with alumni professionals and build long-term professional connections.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* HOW IT WORKS */}

            {/* HOW IT WORKS */}

            <section className="py-28 bg-slate-950 text-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-24">
                        <h3 className="text-5xl font-bold mb-6">How The Platform Works</h3>

                        <p className="text-slate-400 text-xl max-w-3xl mx-auto">
                            Build strong alumni relationships through networking, mentorship, and professional
                            communication.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-10">
                        {/* STEP 1 */}
                        <div
                            className="
               bg-slate-900
               border border-slate-800
               rounded-3xl
               p-10
               hover:border-indigo-500
               transition-all duration-300
            "
                        >
                            <div
                                className="
               w-20 h-20
               rounded-3xl
               bg-indigo-600
               flex items-center justify-center
               text-4xl mb-8
            "
                            >
                                👤
                            </div>

                            <h4 className="text-2xl font-bold mb-4">Create Your Profile</h4>

                            <p className="text-slate-400 leading-relaxed">
                                Build your professional alumni profile and showcase your experience, company, and
                                expertise.
                            </p>
                        </div>

                        {/* STEP 2 */}
                        <div
                            className="
               bg-slate-900
               border border-slate-800
               rounded-3xl
               p-10
               hover:border-purple-500
               transition-all duration-300
            "
                        >
                            <div
                                className="
               w-20 h-20
               rounded-3xl
               bg-purple-600
               flex items-center justify-center
               text-4xl mb-8
            "
                            >
                                🤝
                            </div>

                            <h4 className="text-2xl font-bold mb-4">Expand Your Network</h4>

                            <p className="text-slate-400 leading-relaxed">
                                Connect with alumni professionals across industries and grow meaningful professional
                                relationships.
                            </p>
                        </div>

                        {/* STEP 3 */}
                        <div
                            className="
               bg-slate-900
               border border-slate-800
               rounded-3xl
               p-10
               hover:border-pink-500
               transition-all duration-300
            "
                        >
                            <div
                                className="
               w-20 h-20
               rounded-3xl
               bg-pink-600
               flex items-center justify-center
               text-4xl mb-8
            "
                            >
                                💬
                            </div>

                            <h4 className="text-2xl font-bold mb-4">Collaborate & Mentor</h4>

                            <p className="text-slate-400 leading-relaxed">
                                Share knowledge, provide mentorship, and create valuable long-term alumni connections.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}

            <section className="py-24 text-center bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white">
                <h3 className="text-3xl font-bold mb-6">Start Building Your Network Today</h3>

                <p className="mb-8 text-lg">Join the Gradious Alumni community and unlock new career opportunities.</p>

                <button
                    onClick={() => navigate("/register")}
                    className="bg-white text-indigo-600 px-10 py-4 rounded-xl font-semibold hover:bg-gray-200 transition"
                >
                    Create Account
                </button>
            </section>

            {/* FOOTER */}

            <footer className="text-center py-8 text-indigo-700">
                <p className="font-semibold">© {new Date().getFullYear()} Gradious Alumni Connect</p>

                <p className="text-sm mt-2 text-purple-600">
                    Connecting students with alumni for mentorship and career growth.
                </p>
            </footer>
        </div>
    );
}

export default Home;
