import {
  type UseMutationOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";

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

export type AuthSessionResponse = {
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
};

export type GetApprovalsError = { type: "Unauthorized" } | { type: "Unknown" };

export type ApproveQrLoginRequest = {
  challengeUrl: string;
  persistence: ESessionPersistence;
};

export const getSessions = async () =>
  invoke<AuthSessionResponse[]>("get_sessions");

export const useSessions = () =>
  useQuery<AuthSessionResponse[], GetApprovalsError>({
    queryKey: ["auth", "sessions"],
    queryFn: getSessions,
  });

export type AuthApproveRequest = {
  /** format: u64 */
  clientId: number;
  persistence: ESessionPersistence;
};

export type AuthDenyRequest = {
  /** format: u64 */
  clientId: number;
};

export enum AuthApprovalError {
  Unauthorized = "unauthorized",
  Expired = "expired",
  DuplicateRequest = "duplicate-request",
  Unknown = "unknown",
}

export const approveSession = async (
  payload: AuthApproveRequest
): Promise<void> =>
  invoke<void>("approve_session", {
    payload: {
      client_id: payload.clientId,
      persistence: payload.persistence,
    },
  });

export const useApproveSession = (
  options?: Omit<
    UseMutationOptions<void, AuthApprovalError, AuthApproveRequest>,
    "mutationFn"
  >
) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...rest } = options || {};
  const mutation = useMutation<void, AuthApprovalError, AuthApproveRequest>({
    mutationFn: approveSession,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["auth", "sessions"] });
      onSuccess?.(...args);
    },
    ...rest,
  });
  return mutation;
};

export const denySession = async (payload: AuthDenyRequest): Promise<void> =>
  invoke<void>("deny_session", {
    payload: {
      client_id: payload.clientId,
    },
  });

export const useDenySession = (
  options?: Omit<
    UseMutationOptions<void, AuthApprovalError, AuthDenyRequest>,
    "mutationFn"
  >
) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...rest } = options || {};
  const mutation = useMutation<void, AuthApprovalError, AuthDenyRequest>({
    mutationFn: denySession,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["auth", "sessions"] });
      onSuccess?.(...args);
    },
    ...rest,
  });
  return mutation;
};
