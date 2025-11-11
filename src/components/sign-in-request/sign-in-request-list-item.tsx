import { ChevronRight, MapPin } from "lucide-react";
import type { ComponentProps } from "react";
import { Link } from "react-router";
import { useActiveAccount } from "~/api/account";
import type { AuthSessionResponse } from "~/api/authentication-approvals";
import { cn } from "~/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

type SignInRequestListItemProps = {
  session: AuthSessionResponse;
} & ComponentProps<"li">;

export const SignInRequestListItem = ({
  session,
  className,
  ...props
}: SignInRequestListItemProps) => {
  const accountQuery = useActiveAccount();

  return (
    <li className={cn("w-full", className)} {...props}>
      <Link
        key={session.clientId}
        to={`/sign-in-requests/${session.clientId}`}
        className="w-full flex justify-between gap-2 group relative overflow-hidden rounded-xs bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg"
      >
        <Avatar className="h-12 w-12 rounded-none">
          <AvatarImage src={accountQuery.data?.avatarUrl} />
          <AvatarFallback className=" rounded-none bg-linear-to-br from-primary to-accent text-white font-semibold">
            <img alt="avatar" src="/default_steam_avatar.jpg"></img>
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-col justify-around grow min-w-0 text-left">
          <header className="ml-0.5 text-sm font-bold text-foreground truncate">
            {accountQuery.data?.username}
          </header>

          <p className="text-md align-bottom text-muted-foreground">
            <MapPin className="size-4 inline mr-0.5 -ml-0.5 mb-1" />
            <span className="inline-block">{` ${session.city}, ${session.country}`}</span>
          </p>
        </div>

        <ChevronRight className="ml-3 mr-1 size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity self-center" />
      </Link>
    </li>
  );
};
