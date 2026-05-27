// import {useEffect, useState} from "react";
// import API from "../services/api";

// function PendingRequests() {
//     const [requests, setRequests] = useState([]);

//     useEffect(() => {
//         fetchRequests();
//     }, []);

//     const fetchRequests = async () => {
//         try {
//             const res = await API.get("/users/alumni/pending-requests");

//             setRequests(res.data.requests);
//         } catch (error) {
//             console.error(error);
//         }
//     };

//     // Accept
//     const handleAccept = async (studentId) => {
//         try {
//             const res = await API.put("/users/accept-connection", {
//                 studentId: studentId,
//             });

//             alert(res.data.message);

//             fetchRequests();
//         } catch (error) {
//             console.error(error);

//             alert("Accept failed ❌");
//         }
//     };

//     // Reject
//     const handleReject = async (studentId) => {
//         try {
//             const res = await API.put("/users/reject-connection", {
//                 studentId: studentId,
//             });

//             alert(res.data.message);

//             fetchRequests();
//         } catch (error) {
//             console.error(error);

//             alert("Reject failed ❌");
//         }
//     };

//     return (
//         <div className="p-10">
//             <h1 className="text-2xl font-bold mb-6">Pending Connection Requests</h1>

//             {requests.length === 0 ? (
//                 <p>No pending requests</p>
//             ) : (
//                 requests.map((req) => (
//                     <div key={req.student_id} className="border p-4 mb-4 rounded shadow">
//                         <h3 className="font-semibold text-lg">{req.name}</h3>

//                         <p>{req.email}</p>

//                         <p>
//                             {req.course} - {req.batch}
//                         </p>

//                         <div className="mt-3 flex gap-3">
//                             <button
//                                 onClick={() => handleAccept(req.student_id)}
//                                 className="bg-green-500 text-white px-4 py-2 rounded"
//                             >
//                                 Accept
//                             </button>

//                             <button
//                                 onClick={() => handleReject(req.student_id)}
//                                 className="bg-red-500 text-white px-4 py-2 rounded"
//                             >
//                                 Reject
//                             </button>
//                         </div>
//                     </div>
//                 ))
//             )}
//         </div>
//     );
// }

// export default PendingRequests;

import {useEffect, useState} from "react";
import API from "../services/api";

function PendingRequests() {
    const [requests, setRequests] = useState([]);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            // Updated to new network endpoint
            const res = await API.get("/users/network/requests");
            setRequests(res.data.requests);
        } catch (error) {
            console.error(error);
        }
    };

    // Accept
    const handleAccept = async (senderId) => {
        try {
            // Updated to new network accept endpoint and senderId payload
            const res = await API.put("/users/network/accept", {
                senderId: senderId,
            });

            alert(res.data.message);
            fetchRequests();
        } catch (error) {
            console.error(error);
            alert("Accept failed ❌");
        }
    };

    // Reject
    const handleReject = async (senderId) => {
        try {
            // Updated to new network reject endpoint and senderId payload
            const res = await API.put("/users/network/reject", {
                senderId: senderId,
            });

            alert(res.data.message);
            fetchRequests();
        } catch (error) {
            console.error(error);
            alert("Reject failed ❌");
        }
    };

    return (
        <div className="p-10">
            <h1 className="text-2xl font-bold mb-6">Pending Connection Requests</h1>

            {requests.length === 0 ? (
                <p>No pending requests</p>
            ) : (
                requests.map((req) => (
                    /* Updated key to use req.id */
                    <div key={req.id} className="border p-4 mb-4 rounded shadow">
                        <h3 className="font-semibold text-lg">{req.name}</h3>

                        <p>{req.email}</p>

                        <p>
                            {req.course} - {req.batch}
                        </p>

                        <div className="mt-3 flex gap-3">
                            <button
                                /* Updated to pass req.id as senderId */
                                onClick={() => handleAccept(req.id)}
                                className="bg-green-500 text-white px-4 py-2 rounded"
                            >
                                Accept
                            </button>

                            <button
                                /* Updated to pass req.id as senderId */
                                onClick={() => handleReject(req.id)}
                                className="bg-red-500 text-white px-4 py-2 rounded"
                            >
                                Reject
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}

export default PendingRequests;