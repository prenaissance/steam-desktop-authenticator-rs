import { Outlet } from "react-router";
import { Breadcrumb } from "./components/breadcrumb";
import { TitleBar } from "./components/titlebar";

export const Layout = () => {
  return (
    <div className="h-screen flex flex-col overflow-y-auto bg-background transition-colors">
      <TitleBar />
      <Breadcrumb />

      <div className="absolute w-[calc(100%-5rem)] top-20 right-20 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none z-50" />
      <div className="absolute w-[calc(100%-5rem)] bottom-20 left-20 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none z-50" />
      <main className="grow py-4 px-6">
        <Outlet />
      </main>
    </div>
  );
};
