import { type UseQueryOptions, useQuery } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";

export type ConfirmationType =
  | "test"
  | "trade"
  | "market-sell"
  | "feature-opt-out"
  | "phone-number-change"
  | "account-recovery"
  | "api-key-creation"
  | "join-steam-family"
  | "unknown";

export interface ConfirmationResponse {
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
}

export type GetConfirmationsError =
  | { type: "Unauthorized" }
  | { type: "ApiError" };

export const getConfirmations = async (): Promise<ConfirmationResponse[]> => {
  const response = await invoke<ConfirmationResponse[]>("get_confirmations");
  return response;
};

export const useConfirmations = (
  options: Omit<
    UseQueryOptions<ConfirmationResponse[], GetConfirmationsError>,
    "queryKey" | "queryFn"
  >,
) =>
  useQuery<ConfirmationResponse[], GetConfirmationsError>({
    queryKey: ["confirmations"],
    queryFn: getConfirmations,
    ...options,
  });
