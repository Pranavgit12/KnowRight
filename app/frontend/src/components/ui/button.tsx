import {
  forwardRef,
  type ButtonHTMLAttributes,
  type AnchorHTMLAttributes,
} from "react";
import { Link, type LinkProps } from "react-router-dom";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "quiet" | "light";

const variantClass: Record<Variant, string> = {
  primary: "button-primary",
  secondary: "button-secondary",
  quiet: "button-quiet",
  light: "button-light",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", ...props }, ref) => (
    <button
      ref={ref}
      className={cn("button", variantClass[variant], className)}
      {...props}
    />
  ),
);
Button.displayName = "Button";

interface AnchorButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: Variant;
}

export const AnchorButton = forwardRef<HTMLAnchorElement, AnchorButtonProps>(
  ({ className, variant = "primary", ...props }, ref) => (
    <a
      ref={ref}
      className={cn("button", variantClass[variant], className)}
      {...props}
    />
  ),
);
AnchorButton.displayName = "AnchorButton";

interface LinkButtonProps extends Omit<LinkProps, "className"> {
  className?: string;
  variant?: Variant;
  children: React.ReactNode;
}

export function LinkButton({
  className,
  variant = "primary",
  ...props
}: LinkButtonProps) {
  return (
    <Link
      className={cn("button", variantClass[variant], className)}
      {...props}
    />
  );
}
