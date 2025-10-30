import { LogOut, User } from "lucide-react";
import { Card } from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useActiveAccount } from "~/hooks/use-accounts";
import { toast } from "sonner";

interface AccountSelectorProps {
  loading?: boolean;
}

export const AccountSelector = ({ loading }: AccountSelectorProps) => {
  const { accounts, account, setActiveAccount, removeAccount } = useActiveAccount();

  if (loading) {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-4 w-[150px]" />
          </div>
        </div>
      </Card>
    );
  }

  if (!account) {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <User className="h-6 w-6 text-gray-500" />
          </div>
          <div>
            <p className="font-medium">No Account Selected</p>
            <p className="text-sm text-gray-500">Please select an account to continue</p>
          </div>
        </div>
      </Card>
    );
  }

  const accountsArray = Object.entries(accounts).map(([username, acc]) => ({
    username,
    ...acc,
  }));

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {account.avatarUrl ? (
            <img
              src={account.avatarUrl}
              alt={account.username}
              className="h-12 w-12 rounded-full"
            />
          ) : (
            <div className="h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <User className="h-6 w-6 text-gray-500" />
            </div>
          )}
          <div>
            <p className="font-medium">{account.username}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {accountsArray.length > 1 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {accountsArray
                  .filter((acc) => acc.username !== account.username)
                  .map((acc) => (
                    <DropdownMenuItem
                      key={acc.username}
                      onClick={async () => {
                        try {
                          await setActiveAccount(acc.username);
                          toast.success(`Switched to account ${acc.username}`);
                        } catch (err) {
                          toast.error(
                            err instanceof Error
                              ? err.message
                              : "Failed to switch account"
                          );
                        }
                      }}
                    >
                      {acc.username}
                    </DropdownMenuItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={async () => {
              try {
                if(!account.username) {
                    toast.error("No account selected to logout, please reload the app!");
                }
                await removeAccount(account.username);
                toast.success(`Logged out from ${account.username}`);
              } catch (err) {
                toast.error(
                  err instanceof Error
                    ? err.message
                    : "Failed to logout"
                );
              }
            }}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};