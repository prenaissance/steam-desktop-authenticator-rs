import { Outlet } from "react-router";
import { TitleBar } from "./components/titlebar";

export const Layout = () => {
  return (
    <div className="h-screen overflow-y-auto bg-background transition-colors">
      <TitleBar />
      <div className="absolute w-[calc(100%-5rem)] top-20 right-20 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute w-[calc(100%-5rem)] bottom-20 left-20 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
      <main className="h-[calc(100vh-36px)] pt-9 px-6">
        <Outlet />
      </main>
    </div>
  );
};
