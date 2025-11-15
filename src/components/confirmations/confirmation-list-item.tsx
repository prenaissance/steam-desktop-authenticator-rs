import type { ComponentProps } from "react";
import { Link } from "react-router";
import type { ConfirmationResponse } from "~/api/confirmations";
import { cn } from "~/lib/utils";
import { useConfirmationSelectionStore } from "~/stores/confirmations/confirmation-selection-store";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Checkbox } from "../ui/checkbox";

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
  const { selectConfirmation, deselectConfirmation, selectedConfirmationIds } =
    useConfirmationSelectionStore();
  return (
    <li
      className={cn(
        "group flex w-full rounded-xs border border-zinc-600 bg-zinc-800 py-1 ring-ring transition-colors duration-300 focus-within:bg-zinc-700 focus-within:ring-2 hover:border-zinc-500 hover:bg-zinc-700",
        className
      )}
      {...props}
    >
      <Link
        className="flex grow gap-2 focus-visible:outline-0"
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
              <p key={index} className="text-foreground text-xs">
                {line}
              </p>
            ))}
          </section>
        </div>
      </Link>
      <Checkbox
        className="mr-2 size-6 self-center rounded-sm"
        checked={selectedConfirmationIds.has(confirmation.id)}
        onCheckedChange={(checked) => {
          if (checked) {
            selectConfirmation(confirmation.id);
          } else {
            deselectConfirmation(confirmation.id);
          }
        }}
      />
    </li>
  );
};
