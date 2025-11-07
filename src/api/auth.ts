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
