import {useEffect, useState, useRef} from "react";
import {useParams, useNavigate} from "react-router-dom";
import API from "../services/api";
import socket from "../services/socket";

const BASE_URL = "http://localhost:5000";

function Chat() {
    const {userId} = useParams();
    const navigate = useNavigate();

    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const [chatUser, setChatUser] = useState(null);

    const [previewFile, setPreviewFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    const [viewImage, setViewImage] = useState(null);

    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    const currentUser = JSON.parse(sessionStorage.getItem("user") || "{}"); /* FETCH DATA */
    const chatUserId = Number(userId);

    if (chatUserId === currentUser.id) {
        alert("You cannot chat with yourself ❌");
        navigate(-1);
        return null;
    }
    const fetchMessages = async () => {
        try {
            const res = await API.get(`/users/messages/${chatUserId}`);
            setMessages(res.data.messages || []);
        } catch (err) {
            console.error("Error fetching messages:", err);
        }
    };

    const fetchChatUser = async () => {
        try {
            const res = await API.get(`/users/profile/${chatUserId}`);
            setChatUser(res.data.user);
        } catch (err) {
            console.error("Error fetching profile:", err);
        }
    };

    useEffect(() => {
        fetchMessages();
        fetchChatUser();

        const markAsRead = async () => {
            try {
                await API.put("/users/messages/mark-read", {
                    senderId: chatUserId,
                });
                fetchMessages();
            } catch (err) {
                console.error("Mark read error:", err);
            }
        };

        markAsRead();
    }, [chatUserId]);

    /* SOCKET */
    useEffect(() => {
        if (!currentUser?.id) return;

        socket.emit("join", currentUser.id.toString());

        const handleNewMessage = (message) => {
            const isRelevant =
                Number(message.sender_id) === Number(chatUserId) || Number(message.receiver_id) === Number(chatUserId);

            if (isRelevant) {
                fetchMessages();
            }
        };

        socket.on("new_message", handleNewMessage);

        return () => {
            socket.off("new_message", handleNewMessage);
        };
    }, [chatUserId, currentUser?.id]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({behavior: "smooth"});
    }, [messages]);

    /* SEND MESSAGE */
    const sendMessage = async () => {
        if (!text.trim() && !previewFile) return;

        try {
            const formData = new FormData();
            formData.append("receiverId", chatUserId);
            formData.append("message", text);

            if (previewFile) {
                formData.append("file", previewFile);
            }

            const res = await API.post("/users/messages/send", formData, {
                headers: {"Content-Type": "multipart/form-data"},
            });

            const messageData = res.data.message;

            socket.emit("sendMessage", messageData);
            setMessages((prev) => [...prev, messageData]);

            setText("");
            setPreviewFile(null);
            setPreviewUrl(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
        } catch (err) {
            console.error("Error sending message:", err.response?.data || err.message);
            alert("Failed to send message.");
        }
    };

    /* FILE HANDLERS */
    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setPreviewFile(file);
        if (file.type.startsWith("image")) {
            setPreviewUrl(URL.createObjectURL(file));
        } else {
            setPreviewUrl("NON_IMAGE_FILE");
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (!file) return;
        setPreviewFile(file);
        if (file.type.startsWith("image")) {
            setPreviewUrl(URL.createObjectURL(file));
        } else {
            setPreviewUrl("NON_IMAGE_FILE");
        }
    };

    const handleDragOver = (e) => e.preventDefault();

    const formatTime = (date) => {
        return new Date(date).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="w-full max-w-4xl h-[85vh] bg-white rounded-xl shadow flex flex-col relative">
                {/* IMAGE MODAL */}
                {viewImage && (
                    <div
                        className="absolute inset-0 z-50 bg-black bg-opacity-90 flex flex-col items-center justify-center p-4 rounded-xl"
                        onClick={() => setViewImage(null)}
                    >
                        <button className="absolute top-4 right-4 text-white text-2xl font-bold">×</button>
                        <img src={viewImage} className="max-w-full max-h-[80%] rounded shadow-lg" alt="Full view" />
                    </div>
                )}

                {/* HEADER */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-4 flex items-center gap-4 rounded-t-xl shadow">
                    <button
                        onClick={() => navigate(-1)}
                        className="bg-indigo-500 px-3 py-1 rounded text-sm hover:bg-indigo-400"
                    >
                        Back
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white text-indigo-600 flex items-center justify-center font-bold">
                            {chatUser?.name?.charAt(0) || "?"}
                        </div>
                        <div>
                            <h2 className="font-semibold">{chatUser?.name || "Connecting..."}</h2>

                            <p className="text-xs text-indigo-200">
                                {chatUser?.last_seen
                                    ? `Last seen ${new Date(chatUser.last_seen).toLocaleTimeString()}`
                                    : "Online"}
                            </p>
                        </div>{" "}
                    </div>
                </div>

                {/* MESSAGES AREA */}
                <div
                    className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-gray-50 to-white"
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                >
                    {messages.length === 0 && (
                        <div className="text-center text-gray-400 mt-10">
                            No messages yet — start the conversation 👋
                        </div>
                    )}

                    {messages.map((msg) => {
                        const isMe = Number(msg.sender_id) === Number(currentUser?.id);
                        const cleanPath = msg.file_url ? msg.file_url.replace(/^\/+/, "") : "";
                        const fileUrl = cleanPath ? `${BASE_URL}/${cleanPath}` : null;
                        const rawFileName = cleanPath ? cleanPath.split("/").pop() : "";
                        const displayName = rawFileName.replace(/^\d+-/, "");
                        const isImage = cleanPath.match(/\.(jpg|jpeg|png|gif|webp)$/i);

                        return (
                            <div
                                key={msg.id}
                                className={`flex items-end gap-2 ${isMe ? "justify-end" : "justify-start"}`}
                            >
                                {/* ✅ ADD THIS BLOCK HERE */}
                                {!isMe && (
                                    <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xs font-bold">
                                        {chatUser?.name?.charAt(0)}
                                    </div>
                                )}
                                <div
                                    className={`max-w-[75%] px-4 py-2 rounded-2xl shadow-sm ${
                                        isMe
                                            ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-br-sm"
                                            : "bg-white border text-gray-800 rounded-bl-sm"
                                    }`}
                                >
                                    {!isMe && msg.sender_role === "admin" && (
                                        <span className="text-xs text-blue-500 font-semibold mb-1 block">Admin</span>
                                    )}

                                    {fileUrl && isImage && (
                                        <img
                                            src={fileUrl}
                                            alt="chat-img"
                                            className="rounded-lg max-h-[260px] w-full object-cover cursor-pointer hover:opacity-90 transition"
                                            onClick={() => setViewImage(fileUrl)}
                                        />
                                    )}

                                    {!isImage && msg.file_url && (
                                        <div
                                            className={`flex justify-between items-center gap-4 p-3 rounded-lg ${
                                                isMe ? "bg-indigo-500 text-white" : "bg-gray-200"
                                            }`}
                                        >
                                            <span className="truncate text-xs">{displayName}</span>
                                            <a
                                                href={`${BASE_URL}/download/${rawFileName}`}
                                                className="underline text-xs font-bold shrink-0"
                                            >
                                                Download
                                            </a>
                                        </div>
                                    )}

                                    {msg.message && <p className="text-sm mt-1 px-1">{msg.message}</p>}

                                    <div className="flex justify-end items-center gap-1 mt-1">
                                        <span
                                            style={{color: isMe ? "#FFFFFF" : "#000000", fontSize: "11px", opacity: 1}}
                                        >
                                            {formatTime(msg.created_at)}
                                        </span>

                                        {isMe && (
                                            <span
                                                style={{
                                                    color: "#FFFFFF",
                                                    fontWeight: "900",
                                                    fontSize: "14px",
                                                    lineHeight: "1",
                                                    display: "inline-block",
                                                    opacity: "1",
                                                    WebkitTextFillColor: "#FFFFFF",
                                                }}
                                            >
                                                {msg.seen ? "✔✔" : "✔"}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef}></div>
                </div>

                {/* FILE PREVIEW OVERLAY */}
                {previewUrl && (
                    <div className="px-4 py-2 bg-gray-200 flex items-center gap-4 border-t">
                        {previewUrl !== "NON_IMAGE_FILE" ? (
                            <img src={previewUrl} className="h-16 w-16 object-cover rounded shadow" alt="preview" />
                        ) : (
                            <div className="h-16 w-16 bg-gray-400 flex items-center justify-center rounded text-white text-[10px] text-center">
                                FILE
                            </div>
                        )}
                        <div className="flex flex-col">
                            <span className="text-xs font-semibold text-gray-700 truncate max-w-[150px]">
                                {previewFile?.name}
                            </span>
                            <div className="flex gap-2 mt-1">
                                <button
                                    onClick={sendMessage}
                                    className="bg-green-600 text-white px-3 py-1 rounded text-xs font-bold"
                                >
                                    Upload & Send
                                </button>
                                <button
                                    onClick={() => {
                                        setPreviewUrl(null);
                                        setPreviewFile(null);
                                        if (fileInputRef.current) fileInputRef.current.value = "";
                                    }}
                                    className="text-red-500 text-xs font-bold"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* INPUT SECTION */}
                <div className="border-t p-4 flex gap-3 items-center">
                    <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileSelect} />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current.click()}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 w-10 h-10 rounded-full flex items-center justify-center text-xl transition shrink-0"
                    >
                        +
                    </button>
                    <input
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                sendMessage();
                            }
                        }}
                        placeholder="Type a message..."
                        className="flex-1 bg-gray-100 border border-gray-200 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                    />
                    <button
                        onClick={sendMessage}
                        className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-5 py-2 rounded-full hover:scale-105 transition"
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Chat;
