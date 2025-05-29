import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";
import { UserStatus } from "@/types/user.types";

const statusIndicatorVariants = cva("relative flex shrink-0 rounded-full", {
  variants: {
    variant: {
      online: "bg-green-500",
      offline: "bg-gray-300 dark:bg-gray-600",
    },
    size: {
      xs: "h-1.5 w-1.5",
      sm: "h-2 w-2",
      md: "h-2.5 w-2.5",
      lg: "h-3 w-3",
      xl: "h-3.5 w-3.5",
    },
    pulse: {
      true: "animate-pulse",
      false: "",
    },
  },
  defaultVariants: {
    variant: "offline",
    size: "md",
    pulse: false,
  },
});

export interface StatusIndicatorProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusIndicatorVariants> {
  status?: UserStatus | "online" | "offline" | null;
}

function getStatusVariant(
  status: UserStatus | "online" | "offline" | null | undefined
): "online" | "offline" {
  if (!status) return "offline";

  if (typeof status === "string") {
    return status as "online" | "offline";
  }

  return status.state as "online" | "offline";
}

export function StatusIndicator({
  className,
  variant,
  size,
  pulse,
  status,
  ...props
}: StatusIndicatorProps) {
  // If status is provided, use it to determine the variant
  const actualVariant = status ? getStatusVariant(status) : variant;

  // Only pulse if online
  const shouldPulse = pulse && actualVariant === "online";

  return (
    <span
      className={cn(
        statusIndicatorVariants({
          variant: actualVariant,
          size,
          pulse: shouldPulse,
        }),
        className
      )}
      {...props}
    />
  );
}
