import { ExternalLink, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { isLoggedIn } from "~/api/auth";
import { useInvokeQuery } from "~/api/hooks";
import { Spinner } from "~/components/ui/spinner";
import { Card } from "~/components/ui/card";
import { AccountSelector } from "~/components/account-selector";
import { NavigationMenu } from "~/components/navigation-menu";
import { useActiveAccount } from "~/hooks/use-accounts";
import { getNavigationItems } from "./utils/navigationPaths";
import { TotpDisplay } from "~/components/totp-display";
import { getTotp } from "~/api/totp";
import { openUrl } from '@tauri-apps/plugin-opener';

export const WelcomePage = () => {
  const { data: userData, loading } = useInvokeQuery(isLoggedIn);
  const {
    loading: otpLoading,
    data: otpData,
    error,
    invalidate,
  } = useInvokeQuery(getTotp);
  const { loading: accountLoading } = useActiveAccount();

  if (loading || accountLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Spinner className="w-10 h-10" />
      </div>
    );
  }

  const handleDocsClick = async () => {
    await openUrl('https://github.com/prenaissance/steam-desktop-authenticator-rs');
  }

  return (
    <motion.div
      className="h-full flex flex-col gap-6 p-6 max-w-6xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <header className="flex justify-between items-center relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/30">
            <Shield className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Steam Guard
            </h1>
            <p className="text-muted-foreground text-sm">
              Secure your Steam account and manage authentications
            </p>
          </div>
        </div>
      </header>

      <Card className="p-4">
        <h2 className="text-muted-foreground font-semibold mb-3">
          Active Account
        </h2>
        <AccountSelector loading={accountLoading} />
      </Card>
      {userData && (
        <div className="w-full flex flex-col items-center justify-center">
          <TotpDisplay
            isLoading={otpLoading}
            data={otpData}
            error={error}
            onRefresh={invalidate}
          />
        </div>
      )}
      <NavigationMenu items={getNavigationItems(!userData)} />
      <div className="mt-auto pt-8">
        <Card
          className="p-6 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          onClick={handleDocsClick}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Need Help?</h3>
              <p className="text-sm text-muted-foreground">
                Check out our documentation for guidance
              </p>
            </div>
            <ExternalLink className="h-5 w-5 text-muted-foreground" />
          </div>
        </Card>
      </div>
    </motion.div>
  );
};
