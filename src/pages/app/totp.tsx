import { Breadcrumb } from "~/components/breadcrumb";
import { TotpDisplay } from "~/components/totp-display"; // We will create this next

export const TotpPage = () => (
  <div className="flex flex-col items-center w-full">
    <div className="w-full max-w-5xl">
      <div className="w-full flex items-center justify-center">
        <Breadcrumb />
      </div>
      <div className="flex flex-col items-center justify-center p-10">
        <TotpDisplay />
      </div>
    </div>
  </div>
);
