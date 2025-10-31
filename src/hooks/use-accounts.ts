import { useContext } from "react";
import { AccountsContext } from "~/providers/accounts-provider";

export interface Account {
  username: string;
  avatarUrl?: string;
  credentials?: {
    password: string;
    sharedSecret: string;
    identitySecret: string;
  };
}

export interface StoredAccounts {
  accounts: Record<string, Account>;
  activeAccount: string | null;
}

export const useActiveAccount = () => {
  const context = useContext(AccountsContext);
  if (!context) {
    throw new Error("useActiveAccount must be used within an AccountsProvider");
  }
  return context;
};