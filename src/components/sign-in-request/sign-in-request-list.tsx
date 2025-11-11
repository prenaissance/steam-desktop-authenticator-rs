import { useSessions } from "~/api/authentication-approvals";
import { SignInRequestListItem } from "./sign-in-request-list-item";

export const SignInRequestList = () => {
  const sessionsQuery = useSessions();

  const sessions = sessionsQuery.data || [];

  if (sessionsQuery && !sessions.length) {
    return (
      <div className="grow py-12 text-center">
        <p className="text-muted-foreground text-sm">No pending requests</p>
      </div>
    );
  }

  return (
    <ul className="w-full grow space-y-3 px-2">
      {sessions.map((session) => (
        <SignInRequestListItem key={session.clientId} session={session} />
      ))}
    </ul>
  );
};
