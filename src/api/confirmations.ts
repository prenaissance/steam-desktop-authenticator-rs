import {
  type UseMutationOptions,
  type UseQueryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";

export enum ConfirmationType {
  Test = "test",
  Trade = "trade",
  MarketSell = "market-sell",
  FeatureOptOut = "feature-opt-out",
  PhoneNumberChange = "phone-number-change",
  AccountRecovery = "account-recovery",
  ApiKeyCreation = "api-key-creation",
  JoinSteamFamily = "join-steam-family",
  Unknown = "unknown",
}

export type ConfirmationResponse = {
  type: ConfirmationType;
  typeName: string;
  id: string;
  /** Trade offer ID or market transaction ID */
  creatorId: string;
  nonce: string;
  /** format: date-time */
  creationTime: string;
  cancel: string;
  accept: string;
  icon: string | null;
  multi: boolean;
  headline: string;
  summary: string[];
};

export type GetConfirmationsError =
  | { type: "Unauthorized" }
  | { type: "ApiError" };

export const getConfirmations = async (): Promise<ConfirmationResponse[]> => {
  const response = await invoke<ConfirmationResponse[]>("get_confirmations");
  return response;
};

export const useConfirmations = (
  options?: Omit<
    UseQueryOptions<ConfirmationResponse[], GetConfirmationsError>,
    "queryKey" | "queryFn"
  >
) =>
  useQuery<ConfirmationResponse[], GetConfirmationsError>({
    queryKey: ["confirmations"],
    queryFn: getConfirmations,
    ...options,
  });

export type ConfirmationActionRequest = {
  id: string;
  nonce: string;
};

export type ConfirmationDetailsResponse = {
  html: string;
};

export const getConfirmationErrors = async (
  payload: ConfirmationActionRequest
): Promise<ConfirmationDetailsResponse> => {
  const response = await invoke<ConfirmationDetailsResponse>(
    "get_confirmation_details",
    { payload }
  );
  return response;
};

export const useConfirmationDetails = (
  payload: ConfirmationActionRequest,
  options: Omit<
    UseQueryOptions<ConfirmationDetailsResponse, GetConfirmationsError>,
    "queryKey" | "queryFn"
  >
) =>
  useQuery<ConfirmationDetailsResponse, GetConfirmationsError>({
    queryKey: ["confirmationDetails", payload.id],
    queryFn: () => getConfirmationErrors(payload),
    ...options,
  });

export enum ConfirmationError {
  Unauthorized = "unauthorized",
  ApiError = "api-error",
  DeserializationError = "deserialization-error",
  NetworkFailure = "network-failure",
}

export const acceptConfirmation = async (
  payload: ConfirmationActionRequest
): Promise<void> => {
  await invoke<void>("accept_confirmation", { payload });
};

export const useAcceptConfirmationMutation = (
  options?: Omit<
    UseMutationOptions<void, ConfirmationError, ConfirmationActionRequest>,
    "queryKey" | "queryFn"
  >
) => {
  const queryClient = useQueryClient();
  return useMutation<void, ConfirmationError, ConfirmationActionRequest>({
    mutationFn: acceptConfirmation,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["confirmations"] });
      options?.onSuccess?.(...args);
    },
  });
};

export const denyConfirmation = async (
  payload: ConfirmationActionRequest
): Promise<void> => {
  await invoke<void>("deny_confirmation", { payload });
};

export const useDenyConfirmationMutation = (
  options?: Omit<
    UseMutationOptions<void, ConfirmationError, ConfirmationActionRequest>,
    "queryKey" | "queryFn"
  >
) => {
  const queryClient = useQueryClient();
  return useMutation<void, ConfirmationError, ConfirmationActionRequest>({
    mutationFn: denyConfirmation,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["confirmations"] });
      options?.onSuccess?.(...args);
    },
  });
};

export const acceptBulkConfirmations = async (
  payload: ConfirmationActionRequest[]
): Promise<void> => {
  await invoke<void>("accept_bulk_confirmations", { payload });
};

export const useAcceptBulkConfirmationsMutation = (
  options?: Omit<
    UseMutationOptions<void, ConfirmationError, ConfirmationActionRequest[]>,
    "queryKey" | "queryFn"
  >
) => {
  const queryClient = useQueryClient();
  return useMutation<void, ConfirmationError, ConfirmationActionRequest[]>({
    mutationFn: acceptBulkConfirmations,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["confirmations"] });
      options?.onSuccess?.(...args);
    },
  });
};

export const denyBulkConfirmations = async (
  payload: ConfirmationActionRequest[]
): Promise<void> => {
  await invoke<void>("deny_bulk_confirmations", { payload });
};

export const useDenyBulkConfirmationsMutation = (
  options?: Omit<
    UseMutationOptions<void, ConfirmationError, ConfirmationActionRequest[]>,
    "queryKey" | "queryFn"
  >
) => {
  const queryClient = useQueryClient();
  return useMutation<void, ConfirmationError, ConfirmationActionRequest[]>({
    mutationFn: denyBulkConfirmations,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["confirmations"] });
      options?.onSuccess?.(...args);
    },
  });
};
