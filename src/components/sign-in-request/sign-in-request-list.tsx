import { AvatarFallback } from "@radix-ui/react-avatar";
import { Clock, MapPin, Zap } from "lucide-react";
import type { FC } from "react";
import { useActiveAccount } from "~/api/account";
import {
  type AuthSessionResponse,
  useSessions,
} from "~/api/authentication-approvals";
import { Avatar, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";

interface SignInRequestListProps {
  onSelect: (requestId: string) => void;
}

export const SignInRequestList: FC<SignInRequestListProps> = ({ onSelect }) => {
  const sessionsQuery = useSessions();
  const account = useActiveAccount();
  const sessions = sessionsQuery.data || [];

  return (
    <ul className="w-full space-y-3">
      {sessions && sessions.length > 0 ? (
        sessions.map((session: AuthSessionResponse) => (
          <li key={session.clientId}>
            <button
              key={session.clientId}
              type="button"
              onClick={() => onSelect(session?.clientId.toString() || "")}
              className="w-full group relative overflow-hidden rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="relative p-4 flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <Avatar className="h-12 w-12 ring-2 ring-border flex-shrink-0">
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white font-semibold">
                      {account.data?.username.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center gap-2 mb-1.5">
                      <h3 className="text-sm font-semibold text-foreground truncate">
                        {account.data?.username}
                      </h3>
                      <Zap className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                    </div>

                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{session.city}</span>
                      </div>
                      <Badge
                        variant="secondary"
                        className="font-mono text-xs flex-shrink-0"
                      >
                        {session.ip}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>{"Just now"}</span>
                    </div>
                  </div>
                </div>

                <div className="ml-3 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg
                    role="img"
                    aria-label="img"
                    className="w-5 h-5 text-primary transition-transform group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </button>
          </li>
        ))
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-sm">No active sessions</p>
        </div>
      )}
    </ul>
  );
};
