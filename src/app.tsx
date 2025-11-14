import "./index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router";
import { Toaster } from "./components/ui/sonner";
import { Layout } from "./layout";
import { ConfirmationDetailsPage } from "./pages/app/confirmations/confirmation-details";
import { ConfirmationsPage } from "./pages/app/confirmations/confirmations";
import { SingInRequestsPage } from "./pages/app/sign-in-requests";
import { ActionSignInRequestPage } from "./pages/app/sign-in-requests/action-sign-in-request";
import { TotpPage } from "./pages/app/totp";
import { AuthSteamPage } from "./pages/auth/steam";
import { WelcomePage } from "./pages/welcome";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

export const App = () => (
  <>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<WelcomePage />} />
            <Route path="/login" element={<AuthSteamPage />} />
            <Route path="/totp" element={<TotpPage />} />
            <Route path="/confirmations">
              <Route index element={<ConfirmationsPage />} />
              <Route
                path=":confirmationId"
                element={<ConfirmationDetailsPage />}
              />
            </Route>
            <Route path="/sign-in-requests">
              <Route index element={<SingInRequestsPage />} />
              <Route path=":clientId" element={<ActionSignInRequestPage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
    <Toaster />
  </>
);
