// import {useEffect, useState} from "react";
// import {useNavigate} from "react-router-dom";
// import DashboardLayout from "../components/DashboardLayout";
// import API from "../services/api";

// function AdminUsers() {
//     const navigate = useNavigate();
//     const [users, setUsers] = useState([]);
//     const [search, setSearch] = useState("");
//     const [page, setPage] = useState(1);

//     const [totalPages, setTotalPages] = useState(1);

//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//         fetchUsers();
//     }, [page, search]);

//     const fetchUsers = async () => {
//         try {
//             setLoading(true);

//             const res = await API.get(`/users?page=${page}&search=${search}`);

//             setUsers(res.data.users);

//             setTotalPages(res.data.totalPages);
//         } catch (error) {
//             console.error("Fetch users error", error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const deleteUser = async (id) => {
//         if (!window.confirm("Are you sure you want to delete this user?")) return;

//         try {
//             await API.delete(`/users/${id}`);

//             fetchUsers();
//         } catch (error) {
//             console.error("Delete user error", error);
//         }
//     };

//     return (
//         <DashboardLayout role="admin">
//             {/* PAGE HEADER */}

//             <div className="flex justify-between items-center mb-6">
//                 <h2 className="text-2xl font-bold text-gray-800">User Management</h2>

//                 <input
//                     type="text"
//                     placeholder="Search users..."
//                     value={search}
//                     onChange={(e) => {
//                         setSearch(e.target.value);
//                         setPage(1);
//                     }}
//                     className="border px-4 py-2 rounded-lg"
//                 />
//             </div>

//             {/* USERS TABLE */}

//             <div className="bg-white rounded-xl shadow-md overflow-hidden">
//                 <table className="w-full">
//                     <thead className="bg-gray-100">
//                         <tr>
//                             <th className="p-3 text-left">ID</th>
//                             <th className="p-3 text-left">Name</th>
//                             <th className="p-3 text-left">Email</th>
//                             <th className="p-3 text-left">Role</th>
//                             <th className="p-3 text-left">Graduation Year</th>
//                             <th className="p-3 text-left">Action</th>
//                         </tr>
//                     </thead>

//                     <tbody>
//                         {loading ? (
//                             <tr>
//                                 <td colSpan="6" className="text-center p-6">
//                                     Loading users...
//                                 </td>
//                             </tr>
//                         ) : users.length === 0 ? (
//                             <tr>
//                                 <td colSpan="6" className="text-center p-6">
//                                     No users found
//                                 </td>
//                             </tr>
//                         ) : (
//                             users.map((user) => (
//                                 <tr key={user.id} className="border-t">
//                                     <td className="p-3">{user.id}</td>

//                                     <td className="p-3">{user.name}</td>

//                                     <td className="p-3">{user.email}</td>

//                                     <td className="p-3 capitalize">{user.role}</td>

//                                     <td className="p-3">{user.batch}</td>

//                                     <td className="p-3 flex gap-2">
//                                         {/* 🔥 CHAT BUTTON */}
//                                         {user.role === "alumni" && (
//                                             <button
//                                                 onClick={() => navigate(`/admin/chat/${user.id}`)}
//                                                 className="bg-indigo-600 text-white px-3 py-1 rounded text-xs hover:bg-indigo-700"
//                                             >
//                                                 Chat 💬
//                                             </button>
//                                         )}

//                                         {/* DELETE BUTTON */}
//                                         <button
//                                             onClick={() => deleteUser(user.id)}
//                                             className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600"
//                                         >
//                                             Delete
//                                         </button>
//                                     </td>
//                                 </tr>
//                             ))
//                         )}
//                     </tbody>
//                 </table>
//             </div>

//             {/* PAGINATION */}

//             <div className="flex justify-center gap-4 mt-6">
//                 <button
//                     disabled={page === 1}
//                     onClick={() => setPage(page - 1)}
//                     className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
//                 >
//                     Previous
//                 </button>

//                 <span className="px-4 py-2">
//                     Page {page} / {totalPages}
//                 </span>

//                 <button
//                     disabled={page === totalPages}
//                     onClick={() => setPage(page + 1)}
//                     className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
//                 >
//                     Next
//                 </button>
//             </div>
//         </DashboardLayout>
//     );
// }

// export default AdminUsers;

import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import API from "../services/api";

function AdminUsers() {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, [page, search]);

    const fetchUsers = async () => {
        try {
            setLoading(true);

            const res = await API.get(`/users?page=${page}&search=${search}`);

            const filtered = res.data.users.filter((u) => u.role !== "admin");
            setUsers(filtered);
            setTotalPages(res.data.totalPages);
        } catch (error) {
            console.error("Fetch users error", error);
        } finally {
            setLoading(false);
        }
    };

    const deleteUser = async (id) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;

        try {
            await API.delete(`/users/${id}`);
            fetchUsers();
        } catch (error) {
            console.error("Delete user error", error);
        }
    };

    return (
        <div className="p-6">
            {/* PAGE HEADER */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">User Management</h2>

                <input
                    type="text"
                    placeholder="Search users..."
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1);
                    }}
                    className="border px-4 py-2 rounded-lg"
                />
            </div>

            {/* USERS TABLE */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-3 text-left">ID</th>
                            <th className="p-3 text-left">Name</th>
                            <th className="p-3 text-left">Email</th>
                            <th className="p-3 text-left">Role</th>
                            <th className="p-3 text-left">Graduation Year</th>
                            <th className="p-3 text-left">Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="6" className="text-center p-6">
                                    Loading users...
                                </td>
                            </tr>
                        ) : users.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="text-center p-6">
                                    No users found
                                </td>
                            </tr>
                        ) : (
                            users.map((user) => (
                                <tr key={user.id} className="border-t">
                                    <td className="p-3">{user.id}</td>
                                    <td className="p-3">{user.name}</td>
                                    <td className="p-3">{user.email}</td>
                                    <td className="p-3 capitalize">{user.role}</td>
                                    <td className="p-3">{user.batch}</td>

                                    <td className="p-3 flex gap-2">
                                        {user.role === "alumni" && (
                                            <button
                                                onClick={() => navigate(`/admin/chat/${user.id}`)}
                                                className="bg-indigo-600 text-white px-3 py-1 rounded text-xs hover:bg-indigo-700"
                                            >
                                                Chat 💬
                                            </button>
                                        )}

                                        <button
                                            onClick={() => deleteUser(user.id)}
                                            className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* PAGINATION */}
            <div className="flex justify-center gap-4 mt-6">
                <button
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                >
                    Previous
                </button>

                <span className="px-4 py-2">
                    Page {page} / {totalPages}
                </span>

                <button
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                    className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                >
                    Next
                </button>
            </div>
        </div>
    );
}

export default AdminUsers;
