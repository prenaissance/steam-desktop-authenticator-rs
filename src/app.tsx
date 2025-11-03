import "./index.css";
import { BrowserRouter, Route, Routes } from "react-router";
import { Toaster } from "./components/ui/sonner";
import { Layout } from "./layout";
import { ConfirmationsPage } from "./pages/app/confirmations";
import { TotpPage } from "./pages/app/totp";
import { AuthSteamPage } from "./pages/auth/steam";
import { WelcomePage } from "./pages/welcome";
import { AccountsProvider } from "./providers/accounts-provider";

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
