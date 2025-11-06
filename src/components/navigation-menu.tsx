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
    <div className="flex gap-3 w-full flex-wrap">
      {items.map((item) => {
        const ButtonContent = (
          <Button
            variant="outline"
            className={`w-full cursor-pointer select-none flex-1 h-16 rounded-2xl border-border/50 bg-secondary/30 hover:bg-secondary hover:border-primary/50 transition-all duration-300 flex items-center justify-center gap-3 group ${
              item.locked
                ? "cursor-not-allowed text-gray-400 dark:text-gray-600"
                : ""
            }`}
            onClick={item.locked ? undefined : item.onClick}
          >
            <div className="p-2 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
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
