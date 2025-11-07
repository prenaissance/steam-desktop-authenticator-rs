import { useQuery } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";

type GetProfileResponse = {
  steamId: string;
  personaName: string | null;
  avatarUrl: string | null;
  accountName: string;
};

export const getProfile = async () => {
  const response = await invoke("get_profile");
  return response as GetProfileResponse;
};

export const useProfile = () =>
  useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
  });

export type AccountResponse = {
  username: string;
  avatarUrl?: string;
};

export interface AccountsResponse {
  accounts: AccountResponse[];
  activeAccountName: string | null;
}

export const getAccounts = async () => {
  const response = await invoke("get_accounts");
  return response as AccountsResponse;
};

export const useAccounts = () =>
  useQuery({
    queryKey: ["accounts", "all"],
    queryFn: getAccounts,
  });

export const getActiveAccount = async () => {
  const response = await invoke("get_active_account");
  return response as AccountResponse | null;
};

export const useActiveAccount = () =>
  useQuery({
    queryKey: ["accounts", "active"],
    queryFn: getActiveAccount,
  });
