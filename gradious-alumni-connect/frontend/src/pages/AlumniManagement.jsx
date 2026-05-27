
import {useEffect, useState} from "react";
import API from "../services/api";

function AlumniManagement() {
    const [alumni, setAlumni] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // EDIT STATES
    const [selectedUser, setSelectedUser] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [loadingUpdate, setLoadingUpdate] = useState(false);

    useEffect(() => {
        fetchAlumni(1);
    }, []);

    const fetchAlumni = async (page = 1) => {
        try {
            setLoading(true);

            const res = await API.get(`/users?page=${page}&limit=10&search=${search}`);
            const alumniOnly = res.data.users.filter((u) => u.role === "alumni");

            setAlumni(alumniOnly);
            setCurrentPage(page);
            setTotalPages(res.data.totalPages);
        } catch (error) {
            console.error(error);
            setAlumni([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Move this alumni to trash?")) return;

        try {
            await API.delete(`/users/delete/${id}`);
            fetchAlumni(currentPage);
        } catch (error) {
            console.error(error);
        }
    };

    const openEdit = (user) => {
        setSelectedUser(user);
        setShowModal(true);
    };

    const handleUpdate = async () => {
        try {
            setLoadingUpdate(true);

            const payload = {
                name: selectedUser.name,
                email: selectedUser.email,
                phone: selectedUser.phone,
                company: selectedUser.company,
                position: selectedUser.position,
                college_name: selectedUser.college_name,
            };

            await API.put(`/users/admin/update-user/${selectedUser.id}`, payload);

            alert("Alumni updated successfully ✅");

            setShowModal(false);
            fetchAlumni(currentPage);
        } catch (error) {
            console.error(error);
            alert("Update failed ❌");
        } finally {
            setLoadingUpdate(false);
        }
    };

    return (
        <div className="p-8 min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
            {/* HEADER */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Alumni Management</h1>
                    <p className="text-gray-500 mt-1">Manage alumni mentors on the platform</p>
                </div>

                <div className="bg-purple-100 text-purple-700 px-5 py-2 rounded-xl font-semibold">
                    {alumni.length} Alumni
                </div>
            </div>

            {/* SEARCH */}
            <div className="bg-white p-4 rounded-xl shadow mb-6 flex gap-4">
                <input
                    type="text"
                    placeholder="Search alumni..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 border px-4 py-2 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                />

                <button
                    onClick={() => fetchAlumni(1)}
                    className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
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
                            <th className="p-4 text-left">Company</th>
                            <th className="p-4 text-left">Position</th>
                            <th className="p-4 text-left">Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="5" className="p-8 text-center">
                                    Loading alumni...
                                </td>
                            </tr>
                        ) : alumni.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="p-8 text-center text-gray-400">
                                    No alumni found
                                </td>
                            </tr>
                        ) : (
                            alumni.map((a) => (
                                <tr key={a.id} className="border-t hover:bg-purple-50">
                                    <td className="p-4 font-medium">{a.name}</td>
                                    <td className="p-4 text-gray-600">{a.email}</td>
                                    <td className="p-4">{a.company || "-"}</td>
                                    <td className="p-4">{a.position || "-"}</td>

                                    <td className="p-4 flex gap-2">
                                        <button
                                            onClick={() => openEdit(a)}
                                            className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                                        >
                                            Edit
                                        </button>

                                        <button
                                            onClick={() => handleDelete(a.id)}
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
                    onClick={() => fetchAlumni(currentPage - 1)}
                    className="px-4 py-2 bg-gray-200 rounded disabled:opacity-40"
                >
                    Previous
                </button>

                <span>
                    Page {currentPage} of {totalPages}
                </span>

                <button
                    disabled={currentPage === totalPages}
                    onClick={() => fetchAlumni(currentPage + 1)}
                    className="px-4 py-2 bg-gray-200 rounded disabled:opacity-40"
                >
                    Next
                </button>
            </div>

            {/* EDIT MODAL */}
            {showModal && selectedUser && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-xl w-96 shadow-lg">
                        <h2 className="text-lg font-semibold mb-4">Edit Alumni</h2>

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
                            value={selectedUser.company || ""}
                            onChange={(e) => setSelectedUser({...selectedUser, company: e.target.value})}
                            className="w-full border p-2 mb-2 rounded"
                            placeholder="Company"
                        />

                        <input
                            value={selectedUser.position || ""}
                            onChange={(e) => setSelectedUser({...selectedUser, position: e.target.value})}
                            className="w-full border p-2 mb-4 rounded"
                            placeholder="Position"
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
    );
}

export default AlumniManagement;