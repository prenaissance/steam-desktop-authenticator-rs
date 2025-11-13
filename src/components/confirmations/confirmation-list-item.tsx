import type { ComponentProps } from "react";
import { Link } from "react-router";
import type { ConfirmationResponse } from "~/api/confirmations";
import { cn } from "~/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

const formatDateTime = (dateTimeString: string): string => {
  const date = new Date(dateTimeString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diff / 1000 / 60);
  if (diffMinutes < 2) {
    return "just now";
  }
  return date.toLocaleString();
};

export type ConfirmationListItemProps = {
  confirmation: ConfirmationResponse;
} & ComponentProps<"li">;

export const ConfirmationListItem = ({
  confirmation,
  className,
  ...props
}: ConfirmationListItemProps) => {
  return (
    <li className={cn("w-full gap-2", className)} {...props}>
      <Link
        className="flex w-full gap-2 rounded-xs border border-zinc-600 bg-zinc-800 transition-colors duration-300 hover:border-zinc-500 hover:bg-zinc-700 focus-visible:bg-zinc-700"
        to={`/confirmations/${confirmation.id}`}
      >
        <Avatar className="my-3 ml-3 h-12 w-12 rounded-none">
          <AvatarImage src={confirmation.icon ?? undefined} />
          <AvatarFallback className="rounded-none bg-linear-to-br from-primary to-accent font-semibold text-white">
            <img alt="avatar" src="/default_steam_avatar.jpg"></img>
          </AvatarFallback>
        </Avatar>
        <div>
          <header className="text-muted-foreground text-xs">
            {confirmation.typeName.toUpperCase()} -{" "}
            {formatDateTime(confirmation.creationTime)}
          </header>
          <section>
            <h2 className="font-bold text-foreground text-sm">
              {confirmation.headline}
            </h2>
            {confirmation.summary.map((line, index) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: static info
              <p key={index} className="text-foreground text-sm">
                {line}
              </p>
            ))}
          </section>
        </div>
      </Link>
    </li>
  );
};
