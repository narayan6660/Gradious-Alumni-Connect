import {useNavigate, Outlet, useLocation} from "react-router-dom";
import {useEffect, useState, useRef, useCallback} from "react";

import DashboardLayout from "../components/DashboardLayout";
import API from "../services/api";

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Area,
    AreaChart,
} from "recharts";

function AdminDashboard() {
    const navigate = useNavigate();
    const location = useLocation();
    const isDashboard = location.pathname === "/admin/dashboard";

    const [stats, setStats] = useState({
        totalUsers: 0,

        totalAlumni: 0,
        totalAdmins: 0,
        totalConnections: 0,
        deletedUsers: 0,
    });
    const [growthData, setGrowthData] = useState([]);
    const [activity, setActivity] = useState([]);
    const [recentUsers, setRecentUsers] = useState([]);

    const [activityPage, setActivityPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filter, setFilter] = useState("all");

    const [loading, setLoading] = useState(true);
    const [loadingActivity, setLoadingActivity] = useState(false);

    const COLORS = ["#6366f1", "#a855f7", "#ec4899"];

    // const filterConfig = {
    //     all: {label: "All Activity", color: "bg-slate-800", icon: "📊"},
    //     message: {label: "Messages", color: "bg-amber-500", icon: "💬"},
    //     connection: {label: "Connections", color: "bg-emerald-500", icon: "🤝"},
    //     register: {label: "New Joins", color: "bg-blue-500", icon: "👤"},
    // };
    const filterConfig = {
        all: {label: "All Activity", color: "bg-indigo-600", icon: "📊"},
        message: {label: "Messages", color: "bg-amber-500", icon: "💬"},
        connection: {label: "Connections", color: "bg-emerald-500", icon: "🤝"},
        register: {label: "New Joins", color: "bg-blue-500", icon: "👤"},
    };
    const userDistribution = [
        {name: "Alumni", value: stats.totalAlumni || 0},
        {name: "Admins", value: stats.totalAdmins || 0},
    ];

    const fetchActivity = useCallback(async (page, currentFilter) => {
        try {
            setLoadingActivity(true);
            const typeParam = currentFilter === "all" ? "" : `&type=${currentFilter}`;
            const res = await API.get(`/users/admin/activity?page=${page}&limit=5${typeParam}`);
            setActivity(res.data.activity || []);
            setTotalPages(res.data.totalPages || 1);
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingActivity(false);
        }
    }, []);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const [statsRes, growthRes, recentRes] = await Promise.all([
                API.get("/users/admin/stats"),
                API.get("/users/monthly-growth"),
                API.get("/users/admin/recent-users"),
            ]);

            setStats(statsRes.data);
            setGrowthData(growthRes.data.data || []);
            setRecentUsers(recentRes.data.users || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        fetchActivity(activityPage, filter);
    }, [activityPage, filter, fetchActivity]);

    const handleFilterClick = (newFilter) => {
        setFilter(newFilter);
        setActivityPage(1);
    };

    const handleExport = async () => {
        const res = await API.get("/users/export", {responseType: "blob"});
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "report.csv");
        document.body.appendChild(link);
        link.click();
    };

    return (
        <DashboardLayout role="admin">
            {isDashboard && (
                <div className="font-sans text-slate-900">
                    {/* STATS TILES */}
                    <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
                        {[
                            {label: "Users", val: stats.totalUsers, icon: "👥"},
                            {label: "Admins", val: stats.totalAdmins, icon: "🛡️"},
                            {label: "Alumni", val: stats.totalAlumni, icon: "🏢"},
                            {label: "Linked", val: stats.totalConnections, icon: "🤝"},
                            {label: "Deleted", val: stats.deletedUsers, icon: "🗑️"},
                        ].map((card, i) => (
                            <div
                                key={i}
                                className="px-4 py-4 rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-purple-50 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group"
                            >
                                {/* TOP ROW */}
                                <div className="flex items-center justify-between mb-2">
                                    {/* ICON */}
                                    <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center text-base font-semibold">
                                        {card.icon}
                                    </div>

                                    {/* VALUE */}
                                    <span className="text-lg font-bold text-slate-900">
                                        {loading ? "..." : card.val}
                                    </span>
                                </div>

                                {/* LABEL */}
                                <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                                    {card.label}
                                </p>
                            </div>
                        ))}
                    </div>
                    <div className="grid lg:grid-cols-3 gap-6 mb-6">
                        {/* ================= AREA CHART ================= */}
                        <div className="lg:col-span-2 bg-white/90 backdrop-blur-xl p-6 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-lg transition-all duration-300">
                            {/* HEADER */}
                            <div className="mb-6">
                                <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                                    <span className="w-1 h-5 bg-indigo-600 rounded-full"></span>
                                    User Acquisition
                                </h2>
                                <p className="text-xs text-slate-400 mt-1">Monthly user growth overview</p>
                            </div>

                            {/* CHART */}
                            <ResponsiveContainer width="100%" height={280}>
                                <AreaChart data={growthData}>
                                    <defs>
                                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#6366f1" stopOpacity={0.25} />
                                            <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>

                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />

                                    <XAxis
                                        dataKey="month"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{fill: "#64748b", fontSize: 11}}
                                    />

                                    <YAxis axisLine={false} tickLine={false} tick={{fill: "#64748b", fontSize: 11}} />

                                    <Tooltip
                                        cursor={{stroke: "#6366f1", strokeWidth: 1}}
                                        contentStyle={{
                                            borderRadius: "12px",
                                            border: "1px solid #e2e8f0",
                                            backgroundColor: "#fff",
                                            boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
                                            fontSize: "12px",
                                        }}
                                    />

                                    <Area
                                        type="monotone"
                                        dataKey="totalUsers"
                                        stroke="#4f46e5"
                                        strokeWidth={2.5}
                                        fill="url(#colorUsers)"
                                        dot={{r: 3, strokeWidth: 2, fill: "#fff"}}
                                        activeDot={{r: 5}}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        {/* ================= PIE CHART ================= */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                            {/* HEADER */}
                            <div className="mb-5">
                                <h2 className="text-lg font-semibold text-slate-800">User Distribution</h2>
                                <p className="text-xs text-slate-400 mt-1">Users by category</p>
                            </div>

                            {/* CHART */}
                            <ResponsiveContainer width="100%" height={220}>
                                <PieChart>
                                    <Pie
                                        data={userDistribution}
                                        innerRadius={60}
                                        outerRadius={85}
                                        paddingAngle={5}
                                        dataKey="value"
                                        label={false}
                                    >
                                        {userDistribution.map((_, index) => (
                                            <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>

                                    <Tooltip
                                        formatter={(value, name) => [`${value} users`, name]}
                                        contentStyle={{
                                            borderRadius: "10px",
                                            border: "1px solid #e2e8f0",
                                            fontSize: "11px",
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>

                            {/* LEGEND */}
                            <div className="mt-5 space-y-2">
                                {userDistribution.map((item, index) => (
                                    <div
                                        key={index}
                                        className="flex justify-between items-center px-3 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 transition"
                                    >
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-2.5 h-2.5 rounded-full"
                                                style={{backgroundColor: COLORS[index]}}
                                            ></div>
                                            <span className="text-xs font-medium text-slate-700">{item.name}</span>
                                        </div>

                                        <span className="text-xs font-semibold text-slate-900">{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ACTIVITY & ACTIONS */}
                    <div className="grid lg:grid-cols-4 gap-6">
                        {/* ================= LIVE ACTIVITY ================= */}
                        <div className="lg:col-span-3 bg-white p-7 rounded-[1.8rem] border border-slate-200 shadow-sm">
                            {/* HEADER */}
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-5">
                                <div>
                                    <h2 className="text-xl font-semibold text-slate-900">Live Activity Feed</h2>
                                    <p className="text-sm font-medium text-slate-400 mt-1 uppercase tracking-wide">
                                        Real-time system events
                                    </p>
                                </div>

                                {/* FILTER */}
                                <div className="flex bg-slate-100 p-1.5 rounded-xl border border-slate-200 overflow-x-auto max-w-full">
                                    {Object.keys(filterConfig).map((key) => (
                                        <button
                                            key={key}
                                            onClick={() => handleFilterClick(key)}
                                            className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wide whitespace-nowrap transition-all ${
                                                filter === key
                                                    ? `${filterConfig[key].color} text-white shadow-sm`
                                                    : "text-slate-600 hover:text-slate-900"
                                            }`}
                                        >
                                            {filterConfig[key].label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* ACTIVITY LIST */}
                            <div className="space-y-4 min-h-[380px]">
                                {loadingActivity ? (
                                    <div className="flex flex-col items-center justify-center py-18">
                                        <div className="w-9 h-9 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                ) : activity.length === 0 ? (
                                    <div className="py-18 text-center text-slate-400 font-semibold border-2 border-dashed border-slate-100 rounded-2xl">
                                        NO LOGS FOUND
                                    </div>
                                ) : (
                                    activity.map((item, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center gap-4 p-4 rounded-xl border border-transparent hover:border-indigo-200 hover:bg-indigo-50/40 transition-all"
                                        >
                                            {/* ICON */}
                                            <div
                                                className={`w-11 h-11 shrink-0 rounded-lg flex items-center justify-center text-base font-semibold
                            ${
                                item.type === "message"
                                    ? "bg-indigo-50 text-indigo-600"
                                    : item.type === "connection"
                                    ? "bg-purple-50 text-purple-600"
                                    : "bg-blue-50 text-blue-600"
                            }`}
                                            >
                                                {filterConfig[item.type]?.icon || "📌"}
                                            </div>

                                            {/* TEXT */}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-slate-800 truncate">
                                                    {item.name}
                                                    <span className="font-normal text-slate-500 ml-1 italic">
                                                        {item.type === "message"
                                                            ? "sent a message"
                                                            : item.type === "connection"
                                                            ? "asked to connect"
                                                            : "joined the portal"}
                                                    </span>
                                                </p>

                                                <p className="text-xs text-indigo-500 mt-0.5">
                                                    {new Date(item.created_at || item.time).toLocaleString()}
                                                </p>
                                            </div>

                                            {/* TAG */}
                                            <div
                                                className={`hidden sm:block px-3 py-1 rounded-md text-xs font-semibold uppercase border
                            ${
                                item.type === "message"
                                    ? "bg-indigo-50 text-indigo-600 border-indigo-100"
                                    : item.type === "connection"
                                    ? "bg-purple-50 text-purple-600 border-purple-100"
                                    : "bg-blue-50 text-blue-600 border-blue-100"
                            }`}
                                            >
                                                {item.type}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* PAGINATION */}
                            <div className="mt-8 pt-5 border-t border-slate-100 flex justify-between items-center">
                                <p className="text-sm font-medium text-slate-600">
                                    Page <span className="text-indigo-600">{activityPage}</span> of{" "}
                                    <span className="text-indigo-600">{totalPages}</span>
                                </p>

                                <div className="flex gap-2">
                                    <button
                                        disabled={activityPage === 1}
                                        onClick={() => setActivityPage((p) => p - 1)}
                                        className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm hover:bg-slate-100 disabled:opacity-40"
                                    >
                                        ← Prev
                                    </button>

                                    <button
                                        disabled={activityPage === totalPages}
                                        onClick={() => setActivityPage((p) => p + 1)}
                                        className="px-5 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-500 disabled:opacity-40"
                                    >
                                        Next →
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* ================= RIGHT SIDE ================= */}
                        <div className="space-y-5">
                            {/* QUICK ACTIONS */}
                            <div className="bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 p-7 rounded-[2rem] shadow-xl text-white relative overflow-hidden group">
                                <div className="absolute -right-10 -top-10 w-28 h-28 bg-indigo-500/20 rounded-full blur-3xl"></div>

                                <h2 className="font-semibold text-base mb-5 flex items-center gap-2">
                                    🛠️ Quick Actions
                                </h2>

                                <div className="space-y-3">
                                    <button
                                        onClick={() => navigate("/admin/alumni")}
                                        className="w-full flex items-center justify-between px-5 py-3 rounded-xl bg-white/20 hover:bg-white/30 border border-white/10 text-sm transition"
                                    >
                                        Manage Alumni <span>→</span>
                                    </button>
                                    {/* 🔥 ADD THIS BUTTON HERE */}
                                    <button
                                        onClick={() => navigate("/admin/users")}
                                        className="w-full flex items-center justify-between px-5 py-3 rounded-xl bg-white/20 hover:bg-white/30 border border-white/10 text-sm transition"
                                    >
                                        Start Chat with Alumni 💬 <span>→</span>
                                    </button>

                                    <button
                                        onClick={handleExport}
                                        className="w-full flex items-center justify-between px-5 py-3.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-sm font-semibold transition"
                                    >
                                        Generate Report <span>↓</span>
                                    </button>
                                </div>
                            </div>

                            {/* NEWEST MEMBERS */}
                            <div className="bg-white p-7 rounded-[2rem] border border-slate-200 shadow-sm">
                                <h2 className="text-xs font-bold text-slate-400 mb-5 uppercase tracking-wide">
                                    Newest Members
                                </h2>

                                <div className="space-y-4">
                                    {recentUsers.slice(0, 5).map((user, index) => (
                                        <div key={index} className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
                                                {user.name.charAt(0)}
                                            </div>

                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-slate-800 truncate">
                                                    {user.name}
                                                </p>
                                                <p className="text-[10px] text-indigo-500 uppercase">{user.role}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <Outlet />
        </DashboardLayout>
    );
}

export default AdminDashboard;
