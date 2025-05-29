// filepath: /Users/maitheson/CODE/konvo-chat-app/src/hooks/useTime.ts
import { useCallback, useEffect, useState } from "react";

import { UserStatus } from "@/types/user.types";
import {
  formatRelativeTime,
  formatStatusTime,
  getUpdateInterval,
} from "@/utils/timeFormatters";

/**
 * A versatile hook for time formatting that handles both regular timestamps and user status
 * with automatic real-time updates at varying frequencies based on age.
 *
 * @param input A timestamp (string/Date) or UserStatus object
 * @returns A continuously updating formatted time string
 */
export function useTimeFormat<T>(input: T): string {
  // Memoize the format function to avoid dependency changes
  const formatValue = useCallback((value: T): string => {
    if (value === null || value === undefined) return "";

    // Handle UserStatus objects
    if (typeof value === "object" && value !== null && "state" in value) {
      return formatStatusTime(value as unknown as UserStatus);
    }

    // Handle regular timestamps
    return formatRelativeTime(value as unknown as string | Date);
  }, []);

  const [formattedTime, setFormattedTime] = useState<string>(() =>
    formatValue(input)
  );

  useEffect(() => {
    // Set initial value
    setFormattedTime(formatValue(input));

    if (!input) return;

    // For UserStatus that's online, no need for updates
    if (
      typeof input === "object" &&
      input !== null &&
      "state" in input &&
      (input as unknown as UserStatus).state === "online"
    ) {
      return;
    }

    // Get the timestamp to track
    const timestamp =
      typeof input === "object" && input !== null && "lastChanged" in input
        ? (input as unknown as UserStatus).lastChanged
        : input;

    // Determine initial update interval
    let intervalId = setInterval(() => {
      setFormattedTime(formatValue(input));
    }, getUpdateInterval(timestamp as string | Date | number));

    // Function to reset interval with dynamic timing
    const resetInterval = () => {
      clearInterval(intervalId);
      intervalId = setInterval(() => {
        setFormattedTime(formatValue(input));
        resetInterval(); // Recalculate interval after each update
      }, getUpdateInterval(timestamp as string | Date | number));
    };

    // Set up dynamic interval adjustment
    resetInterval();

    // Cleanup on unmount
    return () => clearInterval(intervalId);
  }, [input, formatValue]);

  return formattedTime;
}

/**
 * Hook for formatting timestamps into human-readable "time ago" strings
 * that update automatically at appropriate intervals
 *
 * @param timestamp The timestamp to format
 * @returns A continuously updating formatted time string
 */
export function useTimeAgo(
  timestamp: string | Date | null | undefined
): string {
  return useTimeFormat(timestamp);
}

/**
 * Hook for formatting user status into human-readable strings
 * that update automatically at appropriate intervals
 *
 * @param status The UserStatus object to format
 * @returns A continuously updating formatted status time string
 */
export function useStatusTimeAgo(
  status: UserStatus | null | undefined
): string {
  return useTimeFormat(status);
}
