import { InfoIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Field,
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

export const AuthSteam = () => {
  const [isLoading, setIsLoading] = useState(false);
  return (
    <form className="flex justify-center pt-8">
      <FieldSet className="max-w-xs w-full">
        <FieldLegend className="font-bold">Steam Authentication</FieldLegend>
        <FieldGroup className="gap-2">
          <Field>
            <FieldLabel htmlFor="steam-username">Steam Username</FieldLabel>
            <Input
              id="steam-username"
              type="text"
              placeholder="Enter your Steam username"
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="steam-password">Steam Password</FieldLabel>
            <Input
              id="steam-password"
              type="password"
              placeholder="Enter your Steam password"
              required
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
                placeholder="kLqX8iYvO0D+5aBc/1k2P4Q=="
                required
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
          </Field>
          <Field>
            <FieldLabel htmlFor="steam-identity-secret">
              Steam Identity Secret
            </FieldLabel>
            <InputGroup>
              <InputGroupInput
                id="steam-identity-secret"
                type="password"
                placeholder="kLqX8iYvO0D+5aBc/1k2P4Q=="
                required
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
          </Field>
          <Button isLoading={isLoading} type="submit" className="w-full mt-4">
            Add Steam Account
          </Button>
        </FieldGroup>
      </FieldSet>
    </form>
  );
};
