import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, LogOut, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useAccounts } from "~/api/account";
import { useTotp } from "~/api/totp";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Card } from "./ui/card";

export const AccountSelector = () => {
  const { data, isFetching } = useAccounts();
  const accounts = data?.accounts || [];
  const activeAccount = accounts.find(
    (acc) => acc.username === data?.activeAccountName
  );
  const { refetch } = useTotp();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (isFetching) {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 animate-pulse rounded-full bg-gray-200" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />
          </div>
        </div>
      </Card>
    );
  }

  if (!activeAccount) {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
            <User className="h-6 w-6 text-gray-500" />
          </div>
          <div>
            <p className="font-medium">No Account Selected</p>
            <p className="text-gray-500 text-sm">Please select an account</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card
      className="relative rounded-2xl border border-border/50 bg-card/50 p-4 shadow-lg backdrop-blur-xl"
      ref={dropdownRef}
    >
      <button
        type="button"
        tabIndex={0}
        className="flex cursor-pointer items-center justify-between gap-2"
        onClick={() => setOpen(!open)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen(!open);
          }
        }}
      >
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </motion.div>

          {activeAccount.avatarUrl ? (
            <Avatar className="h-12 w-12 ring-1 ring-primary/20">
              <AvatarImage src={activeAccount.avatarUrl} />
              <AvatarFallback>
                {activeAccount.username[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
              <User className="h-6 w-6 text-gray-500" />
            </div>
          )}

          <p className="font-medium text-foreground">
            {activeAccount.username}
          </p>
        </div>

        <button
          type="button"
          className="cursor-pointer rounded-full p-2 transition-colors hover:bg-secondary/30"
          onClick={async (e) => {
            e.stopPropagation();
            try {
              if (!activeAccount.username)
                return toast.error("No account selected");
              // TODO call command to remove
              toast.success(`Logged out from ${activeAccount.username}`);
            } catch (err) {
              toast.error(
                err instanceof Error ? err.message : "Failed to logout"
              );
            }
          }}
        >
          <LogOut className="h-4 w-4" />
        </button>
      </button>

      <AnimatePresence>
        {open && accounts.length > 1 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 z-50 mt-2 flex w-full flex-col overflow-hidden rounded-2xl border border-border/50 bg-card/70 shadow-lg backdrop-blur-md"
          >
            {accounts
              .filter((acc) => acc.username !== activeAccount.username)
              .map((acc) => (
                <button
                  type="button"
                  key={acc.username}
                  className="flex cursor-pointer items-center gap-3 p-4 transition-colors hover:bg-card/50"
                  onClick={async () => {
                    try {
                      // TODO: call command to switch account
                      refetch();
                      toast.success(`Switched to ${acc.username}`);
                      setOpen(false);
                    } catch (err) {
                      toast.error(
                        err instanceof Error
                          ? err.message
                          : "Failed to switch account"
                      );
                    }
                  }}
                >
                  {acc.avatarUrl ? (
                    <Avatar className="h-10 w-10 ring-1 ring-primary/20">
                      <AvatarImage src={acc.avatarUrl} />
                      <AvatarFallback>
                        {acc.username[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                      <User className="h-5 w-5 text-gray-500" />
                    </div>
                  )}
                  <p className="font-medium">{acc.username}</p>
                </button>
              ))}
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};
