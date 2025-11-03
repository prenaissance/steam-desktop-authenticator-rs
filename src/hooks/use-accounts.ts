import { useContext } from "react";
import { AccountsContext } from "~/providers/accounts-provider";

export type AccountResponse = {
  username: string;
  avatarUrl?: string;
};

export interface AccountsResponse {
  accounts: AccountResponse[];
  activeAccountName: string | null;
}

export const useActiveAccount = () => {
  const context = useContext(AccountsContext);
  if (!context) {
    throw new Error("useActiveAccount must be used within an AccountsProvider");
  }
  return context;
};
