import {
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  differenceInMonths,
  differenceInSeconds,
  differenceInWeeks,
  differenceInYears,
} from "date-fns";

import { UserStatus } from "@/types/user.types";

/**
 * Format a date/timestamp into a human-readable "time ago" string
 *
 * @param date The timestamp to format (ISO string, Date object, or null/undefined)
 * @returns A formatted string representing time elapsed
 */
export const formatRelativeTime = (
  date: string | Date | number | null | undefined
): string => {
  if (!date) return "";

  try {
    const dateObj =
      typeof date === "string" || typeof date === "number"
        ? new Date(date)
        : date;

    if (isNaN(dateObj.getTime())) return "";

    const now = new Date();

    if (differenceInSeconds(now, dateObj) < 60) {
      return "Now";
    }

    if (differenceInMinutes(now, dateObj) < 60) {
      const minutes = differenceInMinutes(now, dateObj);
      return `${minutes}m ago`;
    }

    if (differenceInHours(now, dateObj) < 24) {
      const hours = differenceInHours(now, dateObj);
      return `${hours}h ago`;
    }

    if (differenceInDays(now, dateObj) < 7) {
      const days = differenceInDays(now, dateObj);
      return `${days}d ago`;
    }

    if (differenceInWeeks(now, dateObj) < 4) {
      const weeks = differenceInWeeks(now, dateObj);
      return `${weeks}w ago`;
    }

    if (differenceInMonths(now, dateObj) < 12) {
      const months = differenceInMonths(now, dateObj);
      return `${months}mo ago`;
    }

    const years = differenceInYears(now, dateObj);
    return `${years}y ago`;
  } catch (error) {
    console.error("Error formatting relative time:", error);
    return "";
  }
};

/**
 * Format user status into a human-readable string
 * For online, it returns "Active now"
 * For offline state, it shows the time since the user went offline
 *
 * @param status The UserStatus object to format
 * @returns A formatted string representing the user's status
 */
export const formatStatusTime = (
  status: UserStatus | null | undefined
): string => {
  if (!status) return "Offline";

  // Online users are always "Active now"
  if (status.state === "online") return "Active now";

  // For offline state, calculate and show how long ago
  if (status.state === "offline" && status.lastChanged) {
    // For offline users, we want "Just now" instead of "Now"
    const now = new Date();
    const offlineDate = new Date(status.lastChanged);

    if (differenceInSeconds(now, offlineDate) < 60) {
      return "Just now";
    }

    // Reuse the same formatting logic but with "Just now" instead of "Now"
    const formatted = formatRelativeTime(status.lastChanged);
    return formatted === "Now" ? "Just now" : formatted;
  }

  return "Offline";
};

// Shorthand aliases for easier imports
export const timeAgo = formatRelativeTime;
export const statusTime = formatStatusTime;

/**
 * Calculate the appropriate update interval based on how old a timestamp is
 * This helps optimize performance by updating recently changed times more frequently
 *
 * @param timestamp The timestamp to check
 * @returns The recommended update interval in milliseconds
 */
export const getUpdateInterval = (
  timestamp: string | Date | number | null | undefined
): number => {
  if (!timestamp) return 3600000; // Default to 1 hour

  const date =
    typeof timestamp === "string" || typeof timestamp === "number"
      ? new Date(timestamp)
      : timestamp;

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  // Less than 1 minute: update every 5 seconds
  if (diffMs < 60000) return 5000;

  // Less than 1 hour: update every 30 seconds
  if (diffMs < 3600000) return 30000;

  // Less than 1 day: update every 5 minutes
  if (diffMs < 86400000) return 300000;

  // Older: update every hour
  return 3600000;
};
