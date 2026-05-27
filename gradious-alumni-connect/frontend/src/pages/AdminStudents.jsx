// import {useEffect, useState} from "react";
// import {useNavigate} from "react-router-dom";
// import DashboardLayout from "../components/DashboardLayout";
// import API from "../services/api";

// function AdminStudents() {
//     const navigate = useNavigate();

//     const [students, setStudents] = useState([]);
//     const [search, setSearch] = useState("");
//     const [loading, setLoading] = useState(true);

//     const [currentPage, setCurrentPage] = useState(1);
//     const [totalPages, setTotalPages] = useState(1);
// const [selectedUser, setSelectedUser] = useState(null);
// const [showModal, setShowModal] = useState(false);
// const [loadingUpdate, setLoadingUpdate] = useState(false);
//     useEffect(() => {
//         fetchStudents(1);
//     }, []);

//     const fetchStudents = async (page = 1) => {
//         try {
//             setLoading(true);

//             const res = await API.get(`/users?page=${page}&limit=10&search=${search}`);

//             const studentsOnly = res.data.users.filter((u) => u.role === "student");

//             setStudents(studentsOnly);

//             setCurrentPage(page);
//             setTotalPages(res.data.totalPages);
//         } catch (error) {
//             console.error(error);
//             setStudents([]);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleDelete = async (id) => {
//         if (!window.confirm("Move this student to trash?")) return;

//         try {
//             await API.delete(`/users/delete/${id}`);
//             fetchStudents(currentPage);
//         } catch (error) {
//             console.error(error);
//         }
//     };

//     return (
//         <DashboardLayout role="admin">
//             <div className="p-8 min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
//                 {/* HEADER */}

//                 <div className="flex justify-between items-center mb-8">
//                     <div>
//                         <h1 className="text-3xl font-bold text-gray-800">Student Management</h1>

//                         <p className="text-gray-500 mt-1">Manage all students registered on the platform</p>
//                     </div>

//                     <div className="bg-indigo-100 text-indigo-700 px-5 py-2 rounded-xl font-semibold">
//                         {students.length} Students
//                     </div>
//                 </div>

//                 {/* SEARCH */}

//                 <div className="bg-white p-4 rounded-xl shadow mb-6 flex gap-4">
//                     <input
//                         type="text"
//                         placeholder="Search students..."
//                         value={search}
//                         onChange={(e) => setSearch(e.target.value)}
//                         className="flex-1 border px-4 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
//                     />

//                     <button
//                         onClick={() => fetchStudents(1)}
//                         className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
//                     >
//                         Search
//                     </button>
//                 </div>

//                 {/* TABLE */}

//                 <div className="bg-white rounded-xl shadow-lg overflow-hidden">
//                     <table className="w-full text-sm">
//                         <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
//                             <tr>
//                                 <th className="p-4 text-left">Name</th>
//                                 <th className="p-4 text-left">Email</th>
//                                 <th className="p-4 text-left">Course</th>
//                                 <th className="p-4 text-left">Batch</th>
//                                 <th className="p-4 text-left">Actions</th>
//                             </tr>
//                         </thead>

//                         <tbody>
//                             {loading ? (
//                                 <tr>
//                                     <td colSpan="5" className="p-8 text-center">
//                                         Loading students...
//                                     </td>
//                                 </tr>
//                             ) : students.length === 0 ? (
//                                 <tr>
//                                     <td colSpan="5" className="p-8 text-center text-gray-400">
//                                         No students found
//                                     </td>
//                                 </tr>
//                             ) : (
//                                 students.map((s) => (
//                                     <tr key={s.id} className="border-t hover:bg-indigo-50">
//                                         <td className="p-4 font-medium">{s.name}</td>

//                                         <td className="p-4 text-gray-600">{s.email}</td>

//                                         <td className="p-4">{s.course || "-"}</td>

//                                         <td className="p-4">{s.batch || "-"}</td>

//                                         <td className="p-4 flex gap-2">
//                                             <button
//                                                 onClick={() => navigate(`/student/chat/${s.id}`)}
//                                                 className="px-3 py-1 bg-indigo-500 text-white rounded hover:bg-indigo-600"
//                                             >
//                                                 Message
//                                             </button>

//                                             <button
//                                                 onClick={() => handleDelete(s.id)}
//                                                 className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
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

//                 {/* PAGINATION */}

//                 <div className="flex justify-center items-center gap-4 mt-6">
//                     <button
//                         disabled={currentPage === 1}
//                         onClick={() => fetchStudents(currentPage - 1)}
//                         className="px-4 py-2 bg-gray-200 rounded disabled:opacity-40"
//                     >
//                         Previous
//                     </button>

//                     <span>
//                         Page {currentPage} of {totalPages}
//                     </span>

//                     <button
//                         disabled={currentPage === totalPages}
//                         onClick={() => fetchStudents(currentPage + 1)}
//                         className="px-4 py-2 bg-gray-200 rounded disabled:opacity-40"
//                     >
//                         Next
//                     </button>
//                 </div>
//             </div>
//         </DashboardLayout>
//     );
// }

// export default AdminStudents;


import {useEffect, useState} from "react";
import DashboardLayout from "../components/DashboardLayout";
import API from "../services/api";

function AdminStudents() {
    const [students, setStudents] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // ✅ EDIT FEATURE STATE
    const [selectedUser, setSelectedUser] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [loadingUpdate, setLoadingUpdate] = useState(false);

    useEffect(() => {
        fetchStudents(1);
    }, []);

    const fetchStudents = async (page = 1) => {
        try {
            setLoading(true);

            const res = await API.get(`/users?page=${page}&limit=10&search=${search}`);

            const studentsOnly = res.data.users.filter((u) => u.role === "student");

            setStudents(studentsOnly);
            setCurrentPage(page);
            setTotalPages(res.data.totalPages);
        } catch (error) {
            console.error(error);
            setStudents([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Move this student to trash?")) return;

        try {
            await API.delete(`/users/delete/${id}`);
            fetchStudents(currentPage);
        } catch (error) {
            console.error(error);
        }
    };

    // ✅ OPEN EDIT MODAL
    const openEdit = (user) => {
        setSelectedUser(user);
        setShowModal(true);
    };

    // ✅ UPDATE USER
    const handleUpdate = async () => {
        try {
            setLoadingUpdate(true);

            const payload = {
                name: selectedUser.name,
                email: selectedUser.email,
                phone: selectedUser.phone,
                course: selectedUser.course,
                batch: selectedUser.batch,
                college_name: selectedUser.college_name,
            };

            await API.put(`/users/admin/update-user/${selectedUser.id}`, payload);

            alert("User updated successfully ✅");

            setShowModal(false);
            fetchStudents(currentPage);
        } catch (error) {
            console.error(error);
            alert("Update failed ❌");
        } finally {
            setLoadingUpdate(false);
        }
    };

    return (
        <DashboardLayout role="admin">
            <div className="p-8 min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
                {/* HEADER */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Student Management</h1>
                        <p className="text-gray-500 mt-1">Manage all students registered on the platform</p>
                    </div>

                    <div className="bg-indigo-100 text-indigo-700 px-5 py-2 rounded-xl font-semibold">
                        {students.length} Students
                    </div>
                </div>

                {/* SEARCH */}
                <div className="bg-white p-4 rounded-xl shadow mb-6 flex gap-4">
                    <input
                        type="text"
                        placeholder="Search students..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="flex-1 border px-4 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    />

                    <button
                        onClick={() => fetchStudents(1)}
                        className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
                    >
                        Search
                    </button>
                </div>

                {/* TABLE */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                            <tr>
                                <th className="p-4 text-left">Name</th>
                                <th className="p-4 text-left">Email</th>
                                <th className="p-4 text-left">Course</th>
                                <th className="p-4 text-left">Batch</th>
                                <th className="p-4 text-left">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center">
                                        Loading students...
                                    </td>
                                </tr>
                            ) : students.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-gray-400">
                                        No students found
                                    </td>
                                </tr>
                            ) : (
                                students.map((s) => (
                                    <tr key={s.id} className="border-t hover:bg-indigo-50">
                                        <td className="p-4 font-medium">{s.name}</td>
                                        <td className="p-4 text-gray-600">{s.email}</td>
                                        <td className="p-4">{s.course || "-"}</td>
                                        <td className="p-4">{s.batch || "-"}</td>

                                        {/* ✅ UPDATED ACTIONS */}
                                        <td className="p-4 flex gap-2">
                                            <button
                                                onClick={() => openEdit(s)}
                                                className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                                            >
                                                Edit
                                            </button>

                                            <button
                                                onClick={() => handleDelete(s.id)}
                                                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
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
                <div className="flex justify-center items-center gap-4 mt-6">
                    <button
                        disabled={currentPage === 1}
                        onClick={() => fetchStudents(currentPage - 1)}
                        className="px-4 py-2 bg-gray-200 rounded disabled:opacity-40"
                    >
                        Previous
                    </button>

                    <span>
                        Page {currentPage} of {totalPages}
                    </span>

                    <button
                        disabled={currentPage === totalPages}
                        onClick={() => fetchStudents(currentPage + 1)}
                        className="px-4 py-2 bg-gray-200 rounded disabled:opacity-40"
                    >
                        Next
                    </button>
                </div>

                {/* ✅ EDIT MODAL */}
                {showModal && selectedUser && (
                    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
                        <div className="bg-white p-6 rounded-xl w-96 shadow-lg">
                            <h2 className="text-lg font-semibold mb-4">Edit Student</h2>

                            <input
                                value={selectedUser.name || ""}
                                onChange={(e) => setSelectedUser({...selectedUser, name: e.target.value})}
                                className="w-full border p-2 mb-2 rounded"
                                placeholder="Name"
                            />

                            <input
                                value={selectedUser.email || ""}
                                onChange={(e) => setSelectedUser({...selectedUser, email: e.target.value})}
                                className="w-full border p-2 mb-2 rounded"
                                placeholder="Email"
                            />

                            <input
                                value={selectedUser.course || ""}
                                onChange={(e) => setSelectedUser({...selectedUser, course: e.target.value})}
                                className="w-full border p-2 mb-2 rounded"
                                placeholder="Course"
                            />

                            <input
                                value={selectedUser.batch || ""}
                                onChange={(e) => setSelectedUser({...selectedUser, batch: e.target.value})}
                                className="w-full border p-2 mb-4 rounded"
                                placeholder="Batch"
                            />

                            <div className="flex justify-end gap-2">
                                <button onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-200 rounded">
                                    Cancel
                                </button>

                                <button onClick={handleUpdate} className="px-4 py-2 bg-indigo-600 text-white rounded">
                                    {loadingUpdate ? "Updating..." : "Save"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}

export default AdminStudents;