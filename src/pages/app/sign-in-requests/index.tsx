import { useSessions } from "~/api/authentication-approvals";
import { SignInRequestContainer } from "~/components/sign-in-request/sign-in-request-container";
import { Button } from "~/components/ui/button";

export const SingInRequestsPage = () => {
  const sessionsQuery = useSessions();
  return (
    <div className="flex flex-col items-center w-full">
      <div className="w-full flex items-center justify-center">
        <Button variant="outline" onClick={() => sessionsQuery.refetch()}>
          Refresh
        </Button>
      </div>
      <div className="flex flex-col items-center justify-center p-3">
        <SignInRequestContainer />
      </div>
    </div>
  );
};
