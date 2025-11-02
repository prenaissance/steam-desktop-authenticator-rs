import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { type LoginRequest, loginFullCredentials } from "~/api/auth";
import type { Account, StoredAccounts } from "~/hooks/use-accounts";

interface AccountsContextType {
  accounts: Record<string, Account>;
  account: Account | null;
  loading: boolean;
  error: Error | null;
  activeAccount: Account | null;
  setActiveAccount: (username: string) => Promise<void>;
  addAccount: (data: LoginRequest) => Promise<void>;
  removeAccount: (username: string) => Promise<void>;
}

export const AccountsContext = createContext<AccountsContextType | null>(null);

let isInitialFetchDone = false;

export const AccountsProvider = ({ children }: { children: React.ReactNode }) => {
  const [accounts, setAccounts] = useState<Record<string, Account>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [activeUsername, setActiveUsername] = useState<string | null>(null);

  const fetchAccounts = useCallback(async (force = false) => {
    if (!force && isInitialFetchDone) return null;
    
    try {
      setLoading(true);
      const stored = await invoke<StoredAccounts>("get_stored_accounts");
      console.log("Fetched accounts", stored);
      
      setAccounts(
        Object.fromEntries(
          Object.entries(stored.accounts).map(([username, account]) => [
            username,
            {
              username: account.username,
              avatarUrl: account.avatarUrl,
              credentials: account.credentials ? {
                password: account.credentials.password,
                sharedSecret: account.credentials.sharedSecret,
                identitySecret: account.credentials.identitySecret,
              } : undefined,
            }
          ])
        )
      );
      
      if (stored.activeAccount) {
        setActiveUsername(stored.activeAccount);
        if (stored.accounts[stored.activeAccount]?.credentials) {
          try {
            await loginFullCredentials({
              username: stored.activeAccount,
              ...stored.accounts[stored.activeAccount].credentials!
            });
          } catch (err) {
            console.error("Failed to login active account", err);
          }
        }
      }

      isInitialFetchDone = true;
      return stored;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch accounts"));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const addAccount = useCallback(async (data: LoginRequest) => {
    try {
      await loginFullCredentials(data);
      await fetchAccounts(true);
    } catch (err) {
      console.log(err);
      throw err instanceof Error ? err : new Error("Failed to store account");
    }
  }, [fetchAccounts]);

  const removeAccount = useCallback(async (username: string) => {
    try {
      await invoke("remove_account", { username });
      await fetchAccounts(true);
    } catch (err) {
      throw err instanceof Error ? err : new Error("Failed to remove account");
    }
  }, [fetchAccounts]);

  const setActive = useCallback(async (username: string) => {
    try {
      await invoke("set_active_account", { username });
      setActiveUsername(username);
    } catch (err) {
      throw err instanceof Error ? err : new Error("Failed to set active account");
    }
  }, [accounts]);

  const activeAccount = activeUsername ? { ...accounts[activeUsername], username: activeUsername } : null;

  return (
    <AccountsContext.Provider
      value={{
        accounts,
        account: activeAccount,
        loading,
        error,
        activeAccount,
        setActiveAccount: setActive,
        addAccount,
        removeAccount,
      }}
    >
      {children}
    </AccountsContext.Provider>
  );
};