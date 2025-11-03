import { useInvokeQuery } from "~/api/hooks";
import { getTotp } from "~/api/totp";
import { Breadcrumb } from "~/components/breadcrumb";
import { TotpDisplay } from "~/components/totp-display"; // We will create this next

export const TotpPage = () => {
  const { loading, data, error, invalidate } = useInvokeQuery(getTotp);

  return (
    <div className="flex flex-col items-center w-full">
      <div className="w-full max-w-5xl">
        <div className="w-full flex items-center justify-center">
          <Breadcrumb />
        </div>
        <div className="flex flex-col items-center justify-center p-10">
          <TotpDisplay
            isLoading={loading}
            data={data}
            error={error}
            onRefresh={invalidate}
          />
        </div>
      </div>
    </div>
  );
};
