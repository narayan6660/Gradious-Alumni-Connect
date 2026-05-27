// import {useEffect, useState} from "react";
// import DashboardLayout from "../components/DashboardLayout";
// import API from "../services/api";

// function TrashPage() {
//     const [users, setUsers] = useState([]);
//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//         fetchDeletedUsers();
//     }, []);

//     const fetchDeletedUsers = async () => {
//         try {
//             const res = await API.get("/users/trash");

//             setUsers(res.data.users || []);
//         } catch (error) {
//             console.error(error);
//             setUsers([]);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleRestore = async (id) => {
//         try {
//             await API.put(`/users/restore/${id}`);

//             fetchDeletedUsers();
//         } catch (error) {
//             console.error(error);
//         }
//     };

//     const handlePermanentDelete = async (id) => {
//         const confirmDelete = window.confirm("Permanently delete this user?");

//         if (!confirmDelete) return;

//         try {
//             await API.delete(`/users/permanent-delete/${id}`);

//             fetchDeletedUsers();
//         } catch (error) {
//             console.error(error);
//         }
//     };

//     return (
//         <DashboardLayout role="admin">
//             <div className="p-6 min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
//                 {/* PAGE HEADER */}

//                 <div className="mb-8">
//                     <h1 className="text-3xl font-bold text-gray-800">Trash Management</h1>

//                     <p className="text-gray-500 mt-1">Restore or permanently remove deleted users</p>
//                 </div>

//                 {/* TABLE CARD */}

//                 <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
//                     <div className="p-6 border-b">
//                         <h2 className="text-lg font-semibold text-gray-700">Deleted Users</h2>
//                     </div>

//                     <table className="w-full text-sm">
//                         <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
//                             <tr>
//                                 <th className="p-4 text-left">Name</th>
//                                 <th className="p-4 text-left">Email</th>
//                                 <th className="p-4 text-left">Role</th>
//                                 <th className="p-4 text-left">Actions</th>
//                             </tr>
//                         </thead>

//                         <tbody>
//                             {loading ? (
//                                 <tr>
//                                     <td colSpan="4" className="p-8 text-center">
//                                         Loading...
//                                     </td>
//                                 </tr>
//                             ) : users.length === 0 ? (
//                                 <tr>
//                                     <td colSpan="4" className="p-8 text-center text-gray-400">
//                                         Trash is empty
//                                     </td>
//                                 </tr>
//                             ) : (
//                                 users.map((u) => (
//                                     <tr key={u.id} className="border-t hover:bg-gray-50 transition">
//                                         <td className="p-4 font-medium text-gray-800">{u.name}</td>

//                                         <td className="p-4 text-gray-600">{u.email}</td>

//                                         <td className="p-4">
//                                             <span
//                                                 className={`px-3 py-1 text-xs font-semibold rounded-full ${
//                                                     u.role === "student"
//                                                         ? "bg-blue-100 text-blue-700"
//                                                         : "bg-purple-100 text-purple-700"
//                                                 }`}
//                                             >
//                                                 {u.role}
//                                             </span>
//                                         </td>

//                                         <td className="p-4 flex gap-3">
//                                             <button
//                                                 onClick={() => handleRestore(u.id)}
//                                                 className="px-4 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm"
//                                             >
//                                                 Restore
//                                             </button>

//                                             <button
//                                                 onClick={() => handlePermanentDelete(u.id)}
//                                                 className="px-4 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm"
//                                             >
//                                                 Delete
//                                             </button>
//                                         </td>
//                                     </tr>
//                                 ))
//                             )}
//                         </tbody>
//                     </table>
//                 </div>
//             </div>
//         </DashboardLayout>
//     );
// }

// export default TrashPage;
import {useEffect, useState} from "react";
import API from "../services/api";

function TrashPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDeletedUsers();
    }, []);

    const fetchDeletedUsers = async () => {
        try {
            const res = await API.get("/users/trash");
            setUsers(res.data.users || []);
        } catch (error) {
            console.error(error);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    const handleRestore = async (id) => {
        try {
            await API.put(`/users/restore/${id}`);
            fetchDeletedUsers();
        } catch (error) {
            console.error(error);
        }
    };

    const handlePermanentDelete = async (id) => {
        const confirmDelete = window.confirm("Permanently delete this user?");
        if (!confirmDelete) return;

        try {
            await API.delete(`/users/permanent-delete/${id}`);
            fetchDeletedUsers();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="p-6 min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
            {/* HEADER */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Trash Management</h1>
                <p className="text-gray-500 mt-1">Restore or permanently remove deleted users</p>
            </div>

            {/* TABLE */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="p-6 border-b">
                    <h2 className="text-lg font-semibold text-gray-700">Deleted Users</h2>
                </div>

                <table className="w-full text-sm">
                    <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                        <tr>
                            <th className="p-4 text-left">Name</th>
                            <th className="p-4 text-left">Email</th>
                            <th className="p-4 text-left">Role</th>
                            <th className="p-4 text-left">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="4" className="p-8 text-center">
                                    Loading...
                                </td>
                            </tr>
                        ) : users.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="p-8 text-center text-gray-400">
                                    Trash is empty
                                </td>
                            </tr>
                        ) : (
                            users.map((u) => (
                                <tr key={u.id} className="border-t hover:bg-gray-50 transition">
                                    <td className="p-4 font-medium text-gray-800">{u.name}</td>

                                    <td className="p-4 text-gray-600">{u.email}</td>

                                    <td className="p-4">
                                        <span
                                            className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                                u.role === "student"
                                                    ? "bg-blue-100 text-blue-700"
                                                    : "bg-purple-100 text-purple-700"
                                            }`}
                                        >
                                            {u.role}
                                        </span>
                                    </td>

                                    <td className="p-4 flex gap-3">
                                        <button
                                            onClick={() => handleRestore(u.id)}
                                            className="px-4 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm"
                                        >
                                            Restore
                                        </button>

                                        <button
                                            onClick={() => handlePermanentDelete(u.id)}
                                            className="px-4 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm"
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
        </div>
    );
}    

export default TrashPage;