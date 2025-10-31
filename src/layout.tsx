import { Outlet } from "react-router-dom";
import { TitleBar } from "./components/titlebar";

export const Layout = () => {
  return (
    <div className="h-screen overflow-hidden bg-background transition-colors">
      <TitleBar />
      <div className="absolute top-20 right-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
      <main className="h-[calc(100vh-36px)] pt-9 px-6">
        <Outlet />
      </main>
    </div>
  );
};
