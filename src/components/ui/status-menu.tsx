import { Check } from "lucide-react";
import React from "react";

import { cn } from "@/lib/utils";
import { UserStatus } from "@/types/user.types";
import { formatStatusTime } from "@/utils/timeFormatters";
import { userPresence } from "@/utils/userPresence";

import { Button } from "./button";

interface StatusMenuProps {
  status: UserStatus | null | undefined;
  className?: string;
}

/**
 * A component that displays status information with buttons to change status
 */
export function StatusMenu({ status, className }: StatusMenuProps) {
  // Determine the current status state
  const currentStatus = status?.state || "offline";

  // Handler to change status
  const handleStatusChange = async (newStatus: "online" | "offline") => {
    switch (newStatus) {
      case "online":
        await userPresence.goOnline();
        break;
      case "offline":
        await userPresence.goOffline();
        break;
    }
  };

  return (
    <div className={cn("flex flex-col", className)}>
      <div className="flex items-center mb-2">
        <span
          className={cn(
            "h-2 w-2 rounded-full mr-2",
            status?.state === "online" ? "bg-green-500" : "bg-slate-400"
          )}
        />
        <span className="text-sm text-muted-foreground">
          {formatStatusTime(status)}
        </span>
      </div>

      <div className="flex space-x-2">
        <Button
          size="sm"
          variant={currentStatus === "online" ? "default" : "outline"}
          onClick={() => handleStatusChange("online")}
          className="flex items-center"
        >
          <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
          <span>Active</span>
          {currentStatus === "online" && <Check className="h-4 w-4 ml-1" />}
        </Button>

        <Button
          size="sm"
          variant={currentStatus === "offline" ? "default" : "outline"}
          onClick={() => handleStatusChange("offline")}
          className="flex items-center"
        >
          <span className="h-2 w-2 rounded-full bg-slate-400 mr-2"></span>
          <span>Offline</span>
          {currentStatus === "offline" && <Check className="h-4 w-4 ml-1" />}
        </Button>
      </div>
    </div>
  );
}
