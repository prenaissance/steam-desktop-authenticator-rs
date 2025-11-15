import { type UseQueryOptions, useQuery } from "@tanstack/react-query";
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

export type ConfirmationActionPayload = {
  id: string;
  nonce: string;
};

export type ConfirmationDetailsResponse = {
  html: string;
};

export const getConfirmationErrors = async (
  payload: ConfirmationActionPayload
): Promise<ConfirmationDetailsResponse> => {
  const response = await invoke<ConfirmationDetailsResponse>(
    "get_confirmation_details",
    { payload }
  );
  return response;
};

export const useConfirmationDetails = (
  payload: ConfirmationActionPayload,
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
