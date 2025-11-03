import { invoke } from "@tauri-apps/api/core";
import { createContext, useCallback, useEffect, useState } from "react";
import { type LoginRequest, loginFullCredentials } from "~/api/auth";
import type { AccountResponse, AccountsResponse } from "~/hooks/use-accounts";

interface AccountsContextType {
  accounts: Map<string, AccountResponse>;
  account: AccountResponse | null;
  loading: boolean;
  error: Error | null;
  activeAccount: AccountResponse | null;
  setActiveAccount: (username: string) => Promise<void>;
  addAccount: (data: LoginRequest) => Promise<void>;
  removeAccount: (username: string) => Promise<void>;
}

export const AccountsContext = createContext<AccountsContextType | null>(null);

let isInitialFetchDone = false;

export const AccountsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [accounts, setAccounts] = useState<Map<string, AccountResponse>>(
    () => new Map(),
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [activeUsername, setActiveUsername] = useState<string | null>(null);

  const fetchAccounts = useCallback(async (force = false) => {
    if (!force && isInitialFetchDone) return null;

    try {
      setLoading(true);
      const stored = await invoke<AccountsResponse>("get_accounts");
      console.log("Fetched accounts", stored);

      setAccounts(new Map(stored.accounts.map((acc) => [acc.username, acc])));

      if (stored.activeAccountName) {
        setActiveUsername(stored.activeAccountName);
      }

      isInitialFetchDone = true;
      return stored;
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to fetch accounts"),
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const addAccount = useCallback(
    async (data: LoginRequest) => {
      try {
        await loginFullCredentials(data);
        await fetchAccounts(true);
      } catch (err) {
        console.log(err);
        throw err instanceof Error ? err : new Error("Failed to store account");
      }
    },
    [fetchAccounts],
  );

  const removeAccount = useCallback(
    async (username: string) => {
      try {
        await invoke("remove_account", { username });
        await fetchAccounts(true);
      } catch (err) {
        throw err instanceof Error
          ? err
          : new Error("Failed to remove account");
      }
    },
    [fetchAccounts],
  );

  const setActive = useCallback(async (username: string) => {
    try {
      await invoke("set_active_account", { username });
      setActiveUsername(username);
    } catch (err) {
      throw err instanceof Error
        ? err
        : new Error("Failed to set active account");
    }
  }, []);

  const activeAccount = activeUsername
    ? (accounts.get(activeUsername) ?? null)
    : null;

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
