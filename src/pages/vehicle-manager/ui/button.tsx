import * as React from "react";
import { Button as AntButton, ButtonProps as AntButtonProps } from "antd";

import { cn } from "../../../lib/utils";

type ButtonVariant =
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | "link";
type ButtonSize = "default" | "sm" | "lg" | "icon";

const buttonVariants = {
  variants: {
    variant: {
      default: "primary",
      destructive: "danger",
      outline: "default",
      secondary: "default",
      ghost: "text",
      link: "link",
    } as const,
    size: {
      default: "middle",
      sm: "small",
      lg: "large",
      icon: "middle",
    } as const,
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
  icon?: AntButtonProps["icon"];
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "default",
      asChild = false,
      icon,
      isLoading = false,
      type, // Destructure the type prop here
      ...props
    },
    ref
  ) => {
    const antVariant = buttonVariants.variants.variant[variant || "default"];
    const antSize = buttonVariants.variants.size[size || "default"];

    if (asChild) {
      return <button className={cn(className)} ref={ref} {...props} />;
    }

    return (
      <AntButton
        type={antVariant} // This is for Ant Design's variant style
        size={antSize}
        className={cn(className)}
        ref={ref as any}
        icon={icon}
        {...props}
        loading={isLoading}
        htmlType={type} // Explicitly set the HTML type attribute
      >
        {props.children}
      </AntButton>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };