import "./index.css";
import { BrowserRouter, Route, Routes } from "react-router";
import { Toaster } from "./components/ui/sonner";
import { Layout } from "./layout";
import { TotpPage } from "./pages/app/totp";
import { AuthSteamPage } from "./pages/auth/steam";
import { WelcomePage } from "./pages/welcome";

export const App = () => (
  <>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<WelcomePage />} />
        </Route>
        <Route path="auth">
          <Route path="steam" element={<AuthSteamPage />} />
        </Route>
        <Route path="app">
          <Route path="totp" element={<TotpPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
    <Toaster />
  </>
);
