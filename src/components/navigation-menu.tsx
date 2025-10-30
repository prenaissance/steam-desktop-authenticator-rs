import { LucideIcon, Lock } from "lucide-react";
import { NavLink } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip";

interface NavigationItem {
  icon: LucideIcon;
  label: string;
  path: string;
  locked?: boolean;
}

interface NavigationMenuProps {
  items: NavigationItem[];
}

export const NavigationMenu = ({ items }: NavigationMenuProps) => {
  return (
    <nav className="space-y-1">
      {items.map((item) => {
        const NavItem = (
          <div
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              item.locked
                ? "text-gray-400 dark:text-gray-600 cursor-not-allowed"
                : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800/50"
            }`}
          >
            <item.icon className="h-5 w-5" />
            <span className="font-medium flex-1">{item.label}</span>
            {item.locked && <Lock className="h-4 w-4" />}
          </div>
        );

        if (item.locked) {
          return (
            <TooltipProvider key={item.path}>
              <Tooltip>
                <TooltipTrigger asChild>
                  {NavItem}
                </TooltipTrigger>
                <TooltipContent>
                  <p>Please login to access this feature</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        }

        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                isActive
                  ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800/50"
              }`
            }
          >
            <item.icon className="h-5 w-5" />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  )
};