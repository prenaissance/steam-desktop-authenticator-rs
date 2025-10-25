import { TooltipTrigger } from "@radix-ui/react-tooltip";
import { Info } from "lucide-react";
import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import { Tooltip, TooltipContent } from "~/components/ui/tooltip";

export const Welcome = () => {
  return (
    <div>
      <h1>Welcome to the Steam Desktop Authenticator!</h1>
      <p>Choose your authentication method:</p>

      <div className="flex flex-col gap-2 mt-4">
        <div className="flex items-center gap-2">
          <Button asChild className="grow">
            <Link to="/auth/totp">Use TOTP</Link>
          </Button>
          <Tooltip>
            <TooltipContent>
              Use this option to use the account JUST for generating TOTPs
            </TooltipContent>
            <TooltipTrigger>
              <Info className="size-6" />
            </TooltipTrigger>
          </Tooltip>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild className="grow">
            <Link to="/auth/steam">Full Steam Guard</Link>
          </Button>
          <Tooltip>
            <TooltipContent>
              Use this option to log into Steam to manage both TOTPs and Steam
              Guard confirmations
            </TooltipContent>
            <TooltipTrigger>
              <Info className="size-6" />
            </TooltipTrigger>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};
