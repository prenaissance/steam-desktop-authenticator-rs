import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./app";
import { setupTray } from "./pages/utils/tray";

setupTray().catch((err) => console.error("Tray setup failed:", err));

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
