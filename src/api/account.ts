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
