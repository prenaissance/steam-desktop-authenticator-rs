import { openUrl } from "@tauri-apps/plugin-opener";
import { motion } from "framer-motion";
import { ExternalLink, Shield } from "lucide-react";
import { useIsLoggedIn } from "~/api/auth";
import { AccountSelector } from "~/components/account-selector";
import { NavigationMenu } from "~/components/navigation-menu";
import { TotpDisplay } from "~/components/totp-display";
import { Card } from "~/components/ui/card";
import { Spinner } from "~/components/ui/spinner";
import { getNavigationItems } from "./utils/navigationPaths";

export const WelcomePage = () => {
  const { data: userData, isFetching: logStatusFetching } = useIsLoggedIn();

  if (logStatusFetching) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner className="h-10 w-10" />
      </div>
    );
  }

  const handleDocsClick = async () => {
    await openUrl(
      "https://github.com/prenaissance/steam-desktop-authenticator-rs"
    );
  };

  return (
    <motion.div
      className="mx-auto flex h-full max-w-6xl flex-col gap-4 px-2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <header className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-linear-to-br from-primary to-accent p-3 shadow-lg shadow-primary/30">
            <Shield className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="bg-linear-to-r from-foreground to-foreground/70 bg-clip-text font-bold text-3xl text-transparent">
              Steam Guard
            </h1>
            <p className="text-muted-foreground text-sm">
              Secure your Steam account and manage authentications
            </p>
          </div>
        </div>
      </header>

      <Card className="p-4">
        <h2 className="mb-3 font-semibold text-muted-foreground">
          Active Account
        </h2>
        <AccountSelector />
      </Card>
      {userData && (
        <div className="flex w-full flex-col items-center justify-center">
          <TotpDisplay />
        </div>
      )}
      <NavigationMenu items={getNavigationItems(!userData)} />
      <div className="mt-auto pt-8">
        <Card
          className="cursor-pointer bg-gray-50 p-6 transition-colors hover:bg-gray-100 dark:bg-gray-900 dark:hover:bg-gray-800"
          onClick={handleDocsClick}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Need Help?</h3>
              <p className="text-muted-foreground text-sm">
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
