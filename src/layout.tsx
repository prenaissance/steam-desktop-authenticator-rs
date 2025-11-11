import { Outlet } from "react-router";
import { Breadcrumb } from "./components/breadcrumb";
import { TitleBar } from "./components/titlebar";

export const Layout = () => {
  return (
    <div className="flex h-screen flex-col overflow-y-auto bg-background transition-colors">
      <TitleBar />
      <Breadcrumb />

      <div className="pointer-events-none absolute top-20 right-20 z-50 h-96 w-[calc(100%-5rem)] rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-20 left-20 z-50 h-96 w-[calc(100%-5rem)] rounded-full bg-accent/10 blur-3xl" />
      <main className="grow px-6 py-4">
        <Outlet />
      </main>
    </div>
  );
};
