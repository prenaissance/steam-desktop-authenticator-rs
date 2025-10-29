import { invoke } from "@tauri-apps/api/core";

export const getTotp = async () => {
  const response = await invoke<string | null>("get_otp");
  return response;
};
