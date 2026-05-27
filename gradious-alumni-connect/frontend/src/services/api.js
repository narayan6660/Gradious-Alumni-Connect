// import axios from "axios";

// const API = axios.create({
//     baseURL: "http://localhost:5000/api",
// });
// API.interceptors.response.use(
//     (response) => response,
//     (error) => {
//         if (error.response?.status === 429) {
//             console.warn("⚠ Too many requests — slow down API calls");
//         }

//         return Promise.reject(error);
//     }
// );
// // ✅ Add token automatically to every request
// API.interceptors.request.use((config) => {
//     const token = localStorage.getItem("token");

//     if (token) {
//         config.headers.Authorization = `Bearer ${token}`;
//     }

//     return config;
// });

// // ✅ Auto logout if 401 error comes
// API.interceptors.response.use(
//     (response) => response,
//     (error) => {
//         if (error.response && error.response.status === 401) {
//             // Remove invalid token
//             localStorage.clear();

//             // Redirect to login
//             window.location.href = "/login";
//         }

//         return Promise.reject(error);
//     }
// );

// export default API;

import axios from "axios";

const API = axios.create({
    baseURL: "https://gradious-backend.onrender.com/api",
});

// ✅ Attach token to every request
API.interceptors.request.use((config) => {
    const token = sessionStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

// ✅ Handle ALL errors in ONE place
API.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;

        // 🔴 Too many requests (DO NOT logout)
        if (status === 429) {
            console.warn("⚠ Too many requests — slow down API calls");
            return Promise.reject(error);
        }

        // if (status === 401) {
        // console.warn("🔒 Session expired. Logging out...");

        // sessionStorage.removeItem("token");
        // sessionStorage.removeItem("user");

        // window.location.href = "/login";
        // }
        if (
            status === 401 &&
            !error.config?.url?.includes("/auth/login") &&
            !error.config?.url?.includes("/auth/register")
        ) {
            console.warn("🔒 Session expired. Logging out...");

            console.log("401 ERROR FROM:", error.config?.url);

            sessionStorage.removeItem("token");

            sessionStorage.removeItem("user");

            window.location.href = "/login";
        }

        return Promise.reject(error);
    }
);

export default API;
