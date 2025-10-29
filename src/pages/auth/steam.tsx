import { zodResolver } from "@hookform/resolvers/zod";
import { InfoIcon } from "lucide-react";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  type LoginError,
  type LoginRequest,
  loginFullCredentials,
  loginRequestSchema,
} from "~/api/auth";
import { Button } from "~/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "~/components/ui/input-group";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";

export const AuthSteamPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginRequest>({
    resolver: zodResolver(loginRequestSchema),
  });
  const onSubmit = useCallback(async (data: LoginRequest) => {
    setIsLoading(true);
    await loginFullCredentials(data)
      .catch((err: LoginError) => {
        toast.error(err.message ?? err.type, {
          dismissible: true,
        });
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <form
      className="flex justify-center pt-8"
      onSubmit={handleSubmit(onSubmit)}
    >
      <FieldSet className="max-w-xs w-full">
        <FieldLegend className="font-bold">Steam Authentication</FieldLegend>
        <FieldGroup className="gap-2">
          <Field>
            <FieldLabel htmlFor="steam-username">Steam Username</FieldLabel>
            <Input
              id="steam-username"
              type="text"
              placeholder="Enter your Steam username"
              {...register("username")}
            />
            <FieldError>{errors.username?.message}</FieldError>
          </Field>
          <Field>
            <FieldLabel htmlFor="steam-password">Steam Password</FieldLabel>
            <Input
              id="steam-password"
              type="password"
              placeholder="Enter your Steam password"
              {...register("password")}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="steam-shared-secret">
              Steam Shared Secret
            </FieldLabel>
            <InputGroup>
              <InputGroupInput
                id="steam-shared-secret"
                type="password"
                placeholder="RGF0YVdpdGhFbm91Z2hQYWRkaW5n"
                {...register("sharedSecret")}
              />
              <InputGroupAddon align="inline-end">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <InputGroupButton
                      variant="ghost"
                      aria-label="Info"
                      size="icon-xs"
                    >
                      <InfoIcon />
                    </InputGroupButton>
                  </TooltipTrigger>
                  <TooltipContent>
                    This secret is used to generate Steam Guard codes
                  </TooltipContent>
                </Tooltip>
              </InputGroupAddon>
            </InputGroup>
            <FieldError>{errors.sharedSecret?.message}</FieldError>
          </Field>
          <Field>
            <FieldLabel htmlFor="steam-identity-secret">
              Steam Identity Secret
            </FieldLabel>
            <InputGroup>
              <InputGroupInput
                id="steam-identity-secret"
                type="password"
                placeholder="RGF0YVdpdGhFbm91Z2hQYWRkaW5n"
                {...register("identitySecret")}
              />
              <InputGroupAddon align="inline-end">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <InputGroupButton
                      variant="ghost"
                      aria-label="Info"
                      size="icon-xs"
                    >
                      <InfoIcon />
                    </InputGroupButton>
                  </TooltipTrigger>
                  <TooltipContent>
                    This secret is used for Steam Guard confirmations. Ensure it
                    is correct, as it can't be verified on login.
                  </TooltipContent>
                </Tooltip>
              </InputGroupAddon>
            </InputGroup>
            <FieldError>{errors.identitySecret?.message}</FieldError>
          </Field>
          <Button isLoading={isLoading} type="submit" className="w-full mt-4">
            Add Steam Account
          </Button>
        </FieldGroup>
      </FieldSet>
    </form>
  );
};
