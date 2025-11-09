import { useSessions } from "~/api/authentication-approvals";
import { Breadcrumb } from "~/components/breadcrumb";
import { SignInRequestContainer } from "~/components/sign-in-request-container";
import { Button } from "~/components/ui/button";

export const AuthConfirmationsPage = () => {
  const sessionsQuery = useSessions();
  console.log(sessionsQuery.data);
  return (
    <div className="flex flex-col items-center w-full">
      <div className="w-full max-w-5xl">
        <div className="w-full flex items-center justify-center">
          <Breadcrumb />
        </div>
        <div className="w-full flex items-center justify-center">
          <Button variant="outline" onClick={() => sessionsQuery.refetch()}>
            Refresh
          </Button>
        </div>
        <div className="flex flex-col items-center justify-center p-3">
          <SignInRequestContainer />
        </div>
      </div>
    </div>
  );
};
