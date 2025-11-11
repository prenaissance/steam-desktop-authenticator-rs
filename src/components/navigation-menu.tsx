import { Lock, type LucideIcon } from "lucide-react";
import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";

type NavigationItem = {
  icon: LucideIcon;
  label: string;
  path?: string;
  locked?: boolean;
  onClick?: () => void;
};

type NavigationMenuProps = {
  items: NavigationItem[];
};

export const NavigationMenu = ({ items }: NavigationMenuProps) => {
  return (
    <div className="flex w-full flex-wrap gap-3">
      {items.map((item) => {
        const ButtonContent = (
          <Button
            variant="outline"
            className={`group flex h-16 w-full flex-1 cursor-pointer select-none items-center justify-center gap-3 rounded-2xl border-border/50 bg-secondary/30 transition-all duration-300 hover:border-primary/50 hover:bg-secondary ${
              item.locked
                ? "cursor-not-allowed text-gray-400 dark:text-gray-600"
                : ""
            }`}
            onClick={item.locked ? undefined : item.onClick}
          >
            <div className="rounded-xl bg-primary/10 p-2 transition-colors group-hover:bg-primary/20">
              <item.icon className="h-5 w-5 text-primary" />
            </div>
            <span className="font-medium">{item.label}</span>
            {item.locked && <Lock className="h-4 w-4" />}
          </Button>
        );

        if (item.locked) {
          return (
            <TooltipProvider key={item.label}>
              <Tooltip>
                <TooltipTrigger asChild>{ButtonContent}</TooltipTrigger>
                <TooltipContent>
                  <p>Please login to access this feature</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        }

        if (item.path) {
          return (
            <Link key={item.path} to={item.path} className="flex-1">
              {ButtonContent}
            </Link>
          );
        }

        return (
          <div key={item.label} className="flex-1">
            {ButtonContent}
          </div>
        );
      })}
    </div>
  );
};
