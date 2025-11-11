import type { ComponentProps } from "react";
import { cn } from "~/lib/utils";

export const SignInRequestSection = ({
  className,
  ...props
}: ComponentProps<"section">) => (
  <section
    className={cn(
      "border border-border bg-linear-to-r from-primary/10 via-accent/5 to-primary/10",
      className,
    )}
    {...props}
  />
);
