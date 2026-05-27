// import { StrictMode } from 'react'
// import { createRoot } from 'react-dom/client'
// import './index.css'
// import App from './App.jsx'

// createRoot(document.getElementById('root')).render(
//   <StrictMode>
//     <App />
//   </StrictMode>,
// )

import {StrictMode} from "react";
import {createRoot} from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import {Toaster} from "react-hot-toast"; // ✅ ADD THIS

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <Toaster position="top-right" /> {/* ✅ ADD THIS */}
        <App />
    </StrictMode>
);