import { ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { isLoggedIn } from "~/api/auth";
import { useInvokeQuery } from "~/api/hooks";
import { Spinner } from "~/components/ui/spinner";
import { Card } from "~/components/ui/card";
import { AccountSelector } from "~/components/account-selector";
import { NavigationMenu } from "~/components/navigation-menu";
import { useActiveAccount } from "~/hooks/use-accounts";
import { getNavigationItems } from "./utils/navigationPaths";
import { Command } from "@tauri-apps/plugin-shell";

const cmd = await Command.create("open", ["https://google.com"]);

export const WelcomePage = () => {
  const { data: userData, loading } = useInvokeQuery(isLoggedIn);
  const { loading: accountLoading } = useActiveAccount();

  if (loading || accountLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Spinner className="w-10 h-10" />
      </div>
    );
  }

  return (
    <motion.div
      className="h-full flex flex-col gap-6 p-6 max-w-6xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div>
        <h1 className="text-2xl font-bold">Steam Desktop Authenticator</h1>
        <p className="text-muted-foreground mt-1">
          Secure your Steam account and manage authentications
        </p>
      </div>

      <Card className="p-4">
        <h2 className="text-base font-semibold mb-3">Active Account</h2>
        <AccountSelector loading={accountLoading} />
      </Card>

      <div className="flex-1 min-h-0">
        <h2 className="text-base font-semibold mb-3">Navigation</h2>
        <Card className="p-4 h-[calc(100%-5rem)]">
          <NavigationMenu items={getNavigationItems(!userData)} />
        </Card>
      </div>

      <div className="mt-auto pt-8">
        <Card
          className="p-6 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          onClick={() =>
            cmd.execute()
          }
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
