import { get, onValue, ref } from "firebase/database";
import { useEffect, useState } from "react";

import { rtdb } from "@/lib/firebase";
import { UserStatus } from "@/types/user.types";
import { userPresence } from "@/utils/userPresence";

import { useTimeFormat } from "./useTime";

/**
 * Hook to get the real-time status of a user from RTDB
 *
 * @param userId - The ID of the user to track
 * @returns The current status of the user
 */
export function useUserStatus(userId: string | undefined): UserStatus | null {
  const [status, setStatus] = useState<UserStatus | null>(null);

  useEffect(() => {
    if (!userId) {
      setStatus(null);
      return;
    }

    // Reference to the user's status in the RTDB
    const statusPath = `/status/${userId}`;
    const userStatusRef = ref(rtdb, statusPath);

    // Check if the path exists in RTDB
    const checkPath = async () => {
      try {
        const snapshot = await get(userStatusRef);
        if (snapshot.exists()) {
          console.log(`useUserStatus: Value at ${statusPath}:`, snapshot.val());
        }
      } catch (error) {
        console.error(
          `useUserStatus: Error checking path ${statusPath}:`,
          error
        );
      }
    };

    checkPath();

    // Listen for changes to the user's status
    const unsubscribe = onValue(
      userStatusRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const userStatus = snapshot.val() as UserStatus;
          setStatus(userStatus);
        } else {
          console.log(
            `useUserStatus: No status data for ${userId}, setting to offline`
          );
          // If no status data exists, set to offline
          setStatus({
            state: "offline",
            lastChanged: Date.now(),
          });
        }
      },
      (error) => {
        console.error(`useUserStatus: Error in onValue for ${userId}:`, error);
      }
    );

    // Clean up the listener when the component unmounts
    return () => {
      unsubscribe();
    };
  }, [userId]);

  return status;
}

/**
 * Hook to manage user presence (current user's online/offline status)
 *
 * This hooks sets up presence tracking for the current user
 * and ensures the cleanup happens when the component unmounts
 *
 * @param userId - The ID of the user to track
 */
export function useUserPresence(userId: string | undefined): void {
  useEffect(() => {
    if (!userId) return;

    // Setup presence when the component mounts
    const setupPresence = async () => {
      await userPresence.setupPresence(userId);
    };

    setupPresence();

    // Clean up when component unmounts
    return () => {
      userPresence.cleanup();
    };
  }, [userId]);
}

/**
 * A convenient hook that combines status fetching and time formatting in one step
 *
 * @param userId - The ID of the user to track
 * @returns A continuously updating formatted status time string
 */
export function useUserStatusTime(userId: string | undefined): string {
  // First get the user's status
  const userStatus = useUserStatus(userId);

  // Then format the status time with our consolidated hook
  const statusTime = useTimeFormat(userStatus);

  return statusTime;
}
