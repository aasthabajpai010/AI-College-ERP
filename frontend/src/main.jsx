// ============================================================
// MAIN.JSX — ENTRY POINT
// ============================================================
// This is the very first file that runs. It takes our <App />
// component and mounts it into the actual HTML page, inside the
// <div id="root"> that Vite's index.html provides.

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css"; // this is where our @import "tailwindcss" line lives
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);