import { useQuery } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import { z } from "zod/v4";

export const loginRequestSchema = z.object({
  username: z.string().trim().min(1),
  password: z.string().trim().min(1),
  sharedSecret: z.base64().trim().length(28),
  identitySecret: z.base64().trim().length(28),
});

export type LoginRequest = z.infer<typeof loginRequestSchema>;

export type LoginResponse = unknown;

export type LoginError = {
  type:
    | "WrongCredentials"
    | "ValidationError"
    | "OtpError"
    | "IOError"
    | "Unimplemented";
  message?: string;
};

export const loginFullCredentials = async (loginRequest: LoginRequest) => {
  const response = await invoke<LoginResponse>("login", {
    payload: loginRequest,
  });
  console.log(response);
  return response;
};

export type IsLoggedInResponse = boolean;

export const isLoggedIn = async () => {
  const response = await invoke<IsLoggedInResponse>("is_logged_in");
  return response;
};

export const useIsLoggedIn = () =>
  useQuery({
    queryKey: ["auth", "is-logged-in"],
    queryFn: isLoggedIn,
  });

export enum EAuthTokenPlatformType {
  Unknown = "k_EAuthTokenPlatformType_Unknown",
  SteamClient = "k_EAuthTokenPlatformType_SteamClient",
  WebBrowser = "k_EAuthTokenPlatformType_WebBrowser",
  MobileApp = "k_EAuthTokenPlatformType_MobileApp",
}
export enum EAuthSessionSecurityHistory {
  Invalid = "k_EAuthSessionSecurityHistory_Invalid",
  UsedPreviously = "k_EAuthSessionSecurityHistory_UsedPreviously",
  NoPriorHistory = "k_EAuthSessionSecurityHistory_NoPriorHistory",
}
export enum ESessionPersistence {
  Invalid = "k_ESessionPersistence_Invalid",
  Ephemeral = "k_ESessionPersistence_Ephemeral",
  Persistent = "k_ESessionPersistence_Persistent",
}

export interface AuthSessionResponse {
  /** format: u64 */
  client_id: number;
  ip?: string | null;
  geoloc?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  platformType?: EAuthTokenPlatformType | null;
  deviceFriendlyName?: string | null;
  version?: number | null;
  loginHistory?: EAuthSessionSecurityHistory | null;
  requestorLocationMismatch?: boolean | null;
  highUsageLogin?: boolean | null;
  requestedPersistence?: ESessionPersistence | null;
}

export type GetApprovalsError = { type: "Unauthorized" } | { type: "Unknown" };

export interface ApproveQrLoginRequest {
  challengeUrl: string;
  persistence: ESessionPersistence;
}

export const getSessions = async () =>
  invoke<AuthSessionResponse[]>("get_sessions");

export const useSessions = () =>
  useQuery<AuthSessionResponse[], GetApprovalsError>({
    queryKey: ["auth", "sessions"],
    queryFn: getSessions,
  });
