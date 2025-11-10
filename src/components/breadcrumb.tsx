import { ChevronDown, ChevronRight, Home, Lock } from "lucide-react";
import { Link, useLocation } from "react-router";
import { useIsLoggedIn } from "~/api/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";

const pathMap: Record<string, string> = {
  "": "Home",
  totp: "TOTP",
  login: "Add account",
  app: "Application",
  confirmations: "Confirmations",
};

export const Breadcrumb = () => {
  const location = useLocation();
  const { data: userData } = useIsLoggedIn();
  const pathSegments = location.pathname.split("/").filter(Boolean);

  const availablePaths = [
    {
      path: "/confirmations",
      label: "Confirmations",
      locked: !userData,
    },
    {
      path: "/login",
      label: "Add account",
    },
    {
      path: "/sign-in-requests",
      label: "Sign-in requests",
      locked: !userData,
    },
  ];

  if (pathSegments.length === 0) {
    return null;
  }

  return (
    <div className="w-full flex items-center justify-center gap-2 mb-6">
      <Link
        to="/"
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <Home className="h-4 w-4" />
        Home
      </Link>

      {pathSegments.map((segment, index) => (
        <div key={segment} className="flex items-center gap-2">
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          {index === pathSegments.length - 1 ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-sm">
                {pathMap[segment] || segment}
                <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {availablePaths
                  .filter((path) => !location.pathname.includes(path.path))
                  .map((path) => {
                    const MenuItem = (
                      <DropdownMenuItem
                        key={path.path}
                        className={
                          path.locked ? "opacity-50 cursor-not-allowed" : ""
                        }
                        disabled={path.locked}
                      >
                        <div className="flex items-center justify-between w-full text-sm">
                          {path.label}
                          {path.locked && <Lock className="h-4 w-4 ml-2" />}
                        </div>
                      </DropdownMenuItem>
                    );

                    if (path.locked) {
                      return (
                        <TooltipProvider key={path.path}>
                          <Tooltip>
                            <TooltipTrigger asChild>{MenuItem}</TooltipTrigger>
                            <TooltipContent>
                              <p>Please login to access this feature</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      );
                    }

                    return (
                      <Link key={path.path} to={path.path} className="w-full">
                        {MenuItem}
                      </Link>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <span className="text-sm text-muted-foreground">
              {pathMap[segment] || segment}
            </span>
          )}
        </div>
      ))}
    </div>
  );
};
