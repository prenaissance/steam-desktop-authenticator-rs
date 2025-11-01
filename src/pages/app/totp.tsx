import { getProfile } from "~/api/account";
import { useInvokeQuery } from "~/api/hooks";
import { getTotp } from "~/api/totp";
import { TotpDisplay } from "~/components/totp-display"; // We will create this next

export const TotpPage = () => {
  const { loading, data, error, invalidate } = useInvokeQuery(getTotp);
  const profileQuery = useInvokeQuery(getProfile);
  console.log(profileQuery);

  return (
    <div className="flex items-center justify-center p-10">
      <TotpDisplay
        isLoading={loading}
        data={data}
        error={error}
        onRefresh={invalidate}
      />
    </div>
  );
};
