import React from "react";

import { cn } from "@/lib/utils";
import { UserStatus } from "@/types/user.types";

import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { StatusIndicator } from "./status-indicator";

export interface AvatarWithStatusProps
  extends React.ComponentPropsWithoutRef<typeof Avatar> {
  src?: string;
  fallback?: string;
  status?: UserStatus | null;
  statusTime?: string;
  size?: "sm" | "md" | "lg";
}

export function AvatarWithStatus({
  className,
  src,
  fallback,
  status,
  statusTime,
  size = "md",
  ...props
}: AvatarWithStatusProps) {
  // Determine the avatar size based on the size prop
  const avatarSizeClasses = {
    sm: "size-8",
    md: "size-10",
    lg: "size-12",
  };

  // Determine whether the user is online
  const isOnline = status?.state === "online";

  return (
    <div className="relative inline-flex">
      <Avatar className={cn(avatarSizeClasses[size], className)} {...props}>
        {src && <AvatarImage src={src} className="w-full h-full" />}
        <AvatarFallback className={cn(avatarSizeClasses[size])}>
          {fallback?.charAt(0) || "?"}
        </AvatarFallback>
      </Avatar>

      {/* Show green dot for online users */}
      {isOnline && (
        <div className="absolute -bottom-0.5 -right-0.5 transform  border-2 border-background dark:border-gray-900 rounded-full z-10">
          <StatusIndicator
            variant="online"
            size="md"
            className="shadow-sm"
            pulse={true}
          />
        </div>
      )}

      {/* Show '... ago' for offline users */}
      {!isOnline && status && statusTime && (
        <span className="absolute -bottom-0.5 -right-0.5 p-0 border rounded-full transform text-xs bg-muted text-muted-foreground whitespace-nowrap">
          {statusTime}
        </span>
      )}
    </div>
  );
}
