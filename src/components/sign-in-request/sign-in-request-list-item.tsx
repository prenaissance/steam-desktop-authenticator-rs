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
        className="group relative flex w-full justify-between gap-2 overflow-hidden rounded-xs border border-border bg-card transition-all duration-300 hover:border-primary/50 hover:shadow-lg"
      >
        <Avatar className="h-12 w-12 rounded-none">
          <AvatarImage src={accountQuery.data?.avatarUrl} />
          <AvatarFallback className="rounded-none bg-linear-to-br from-primary to-accent font-semibold text-white">
            <img alt="avatar" src="/default_steam_avatar.jpg"></img>
          </AvatarFallback>
        </Avatar>

        <div className="flex min-w-0 grow flex-col justify-around text-left">
          <header className="ml-0.5 truncate font-bold text-foreground text-sm">
            {accountQuery.data?.username}
          </header>

          <p className="align-bottom text-md text-muted-foreground">
            <MapPin className="-ml-0.5 mr-0.5 mb-1 inline size-4" />
            <span className="inline-block">{` ${session.city}, ${session.country}`}</span>
          </p>
        </div>

        <ChevronRight className="mr-1 ml-3 size-4 self-center text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
      </Link>
    </li>
  );
};
