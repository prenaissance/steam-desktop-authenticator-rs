import { zodResolver } from "@hookform/resolvers/zod";
import { InfoIcon } from "lucide-react";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { type LoginRequest, loginRequestSchema } from "~/api/auth";
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
} from "~/components/ui/input-group";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { Dropzone } from "~/components/ui/shadcn-io/dropzone";
import { Card } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { Breadcrumb } from "~/components/breadcrumb";
import { useActiveAccount } from "~/hooks/use-accounts";
import { LookUpInput } from "~/components/lookup-input";

interface MaFile {
  account_name: string;
  password: string;
  shared_secret: string;
  identity_secret: string;
}

export const AuthSteamPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginRequest>({
    resolver: zodResolver(loginRequestSchema),
  });

  const { addAccount } = useActiveAccount();

  const onSubmit = useCallback(
    async (data: LoginRequest) => {
      setIsLoading(true);
      try {
        await addAccount(data);
        toast.success("Steam account added successfully!", {
          dismissible: true,
        });
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to add account",
          { dismissible: true },
        );
      } finally {
        setIsLoading(false);
      }
    },
    [addAccount],
  );

  return (
    <form
      className="flex flex-col items-center justify-center w-full"
      onSubmit={handleSubmit(onSubmit)}
    >
      <Breadcrumb />

      <div className="w-full max-w-md">
        <FieldSet className="w-full">
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
              <LookUpInput
                id="steam-password"
                placeholder="Enter your Steam password"
                {...register("password")}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="steam-shared-secret">
                Steam Shared Secret
              </FieldLabel>
              <InputGroup>
                <LookUpInput
                  id="steam-shared-secret"
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
                <LookUpInput
                  id="steam-identity-secret"
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
                      This secret is used for Steam Guard confirmations. Ensure
                      it is correct, as it can't be verified on login.
                    </TooltipContent>
                  </Tooltip>
                </InputGroupAddon>
              </InputGroup>
              <FieldError>{errors.identitySecret?.message}</FieldError>
            </Field>
            <Button disabled={isLoading} type="submit" className="w-full mt-4">
              {isLoading ? "Adding Steam Account..." : "Add Steam Account"}
            </Button>
          </FieldGroup>
        </FieldSet>

        <Separator className="my-6" />
        <Card className="p-4 w-full">
          <h3 className="text-lg font-medium mb-4">Import from .maFile</h3>
          <Dropzone
            maxFiles={1}
            accept={{
              "application/json": [".maFile"],
            }}
            onDrop={(acceptedFiles) => {
              const file = acceptedFiles[0];
              if (!file) return;

              const reader = new FileReader();
              reader.onload = async (event) => {
                try {
                  const text = event.target?.result as string;
                  const data = JSON.parse(text) as MaFile;

                  if (
                    !data.account_name ||
                    !data.shared_secret ||
                    !data.identity_secret
                  ) {
                    throw new Error("Invalid .maFile: Missing required fields");
                  }

                  setValue("username", data.account_name);
                  setValue("sharedSecret", data.shared_secret);
                  setValue("identitySecret", data.identity_secret);

                  toast.success("Successfully loaded .maFile", {
                    dismissible: true,
                  });
                } catch (error) {
                  console.error("Error reading .maFile:", error);
                  toast.error(
                    error instanceof Error
                      ? error.message
                      : "Failed to read .maFile",
                    { dismissible: true },
                  );
                }
              };

              reader.readAsText(file);
            }}
          >
            <div className="flex flex-col items-center justify-center py-4">
              <p className="text-sm font-medium">Upload .maFile</p>
              <p className="text-xs text-muted-foreground mt-1">
                Click to upload your Steam Desktop Authenticator .maFile
              </p>
            </div>
          </Dropzone>
        </Card>
      </div>
    </form>
  );
};
