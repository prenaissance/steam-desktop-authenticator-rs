import "./index.css";
import { LogicalSize, PhysicalSize, Window } from "@tauri-apps/api/window";
import { BrowserRouter, Route, Routes } from "react-router";
import { Toaster } from "./components/ui/sonner";
import { Layout } from "./layout";
import { ConfirmationsPage } from "./pages/app/confirmations";
import { TotpPage } from "./pages/app/totp";
import { AuthSteamPage } from "./pages/auth/steam";
import { WelcomePage } from "./pages/welcome";
import { AccountsProvider } from "./providers/accounts-provider";

// async function resizeToContent() {
//   requestAnimationFrame(async () => {
//     const content = document.documentElement;
//     const width = content.scrollWidth;
//     const height = content.scrollHeight;

//     const window = new Window("main");

//     await window.setSize(new LogicalSize(width, height));
//   });
// }

// window.addEventListener("DOMContentLoaded", resizeToContent);

export const App = () => (
  <>
    <AccountsProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<WelcomePage />} />
            <Route path="/login" element={<AuthSteamPage />} />
            <Route path="/totp" element={<TotpPage />} />
            <Route path="/confirmations" element={<ConfirmationsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AccountsProvider>
    <Toaster />
  </>
);
