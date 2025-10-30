import { Outlet } from "react-router-dom";
import { TitleBar } from "./components/titlebar";

export const Layout = () => {
  return (
    <div className="h-screen overflow-hidden bg-background">
      <TitleBar />
      <main className="h-[calc(100vh-36px)] pt-9">
        <Outlet />
      </main>
    </div>
  );
};
