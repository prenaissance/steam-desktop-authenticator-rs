import { Outlet } from "react-router";

export const Layout = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
      <Outlet />
    </div>
  );
};
