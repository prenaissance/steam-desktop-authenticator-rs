import { useSessions } from "~/api/authentication-approvals";
import { SignInRequestList } from "~/components/sign-in-request/sign-in-request-list";
import { Button } from "~/components/ui/button";

export const SingInRequestsPage = () => {
  const sessionsQuery = useSessions();
  return (
    <div className="flex h-full w-full flex-col items-center">
      <SignInRequestList />
      <Button
        className="mb-6"
        variant="outline"
        onClick={() => sessionsQuery.refetch()}
      >
        Refresh
      </Button>
    </div>
  );
};
