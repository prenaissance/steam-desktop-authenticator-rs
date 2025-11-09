import { type FC, useState } from "react";
import { useSessions } from "~/api/authentication-approvals";
import { SignInRequestCard } from "./sign-in-request-card";
import { SignInRequestList } from "./sign-in-request-list";

export const SignInRequestContainer: FC = () => {
  const sessionsQuery = useSessions();
  console.log(sessionsQuery.data);
  const [selected, setSelected] = useState<string | null>(null);
  const active = sessionsQuery.data?.find(
    (r) => r.clientId?.toString() === selected,
  );

  return (
    <div className="w-full flex flex-col items-center">
      {active ? (
        <SignInRequestCard request={active} onClose={() => setSelected(null)} />
      ) : (
        <SignInRequestList onSelect={setSelected} />
      )}
    </div>
  );
};
