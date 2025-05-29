import {
  DatabaseReference,
  onDisconnect,
  onValue,
  ref,
  set,
} from "firebase/database";
import { doc, setDoc } from "firebase/firestore";

import { db, rtdb } from "@/lib/firebase";
import { UserStatus } from "@/types/user.types";

class UserPresence {
  private userId: string | null = null;
  private userStatusDatabaseRef: DatabaseReference | null = null;
  private isSetup: boolean = false;

  /**
   * Initialize the presence system for a user
   * @param userId - The ID of the user to track
   */
  public async setupPresence(userId: string): Promise<void> {
    if (this.isSetup && this.userId === userId) return;

    this.userId = userId;
    this.userStatusDatabaseRef = ref(rtdb, `/status/${userId}`);
    this.isSetup = true;

    // Set up initial status and onDisconnect updates
    await this.goOnline();

    // Set up a callback for connection state changes
    const connectedRef = ref(rtdb, ".info/connected");
    onValue(connectedRef, async (snapshot) => {
      // If we're not connected, don't do anything.
      if (snapshot.val() === false) {
        return;
      }

      // If we are connected, setup the onDisconnect hooks
      if (this.userStatusDatabaseRef) {
        // When the client is disconnected, this onDisconnect will automatically trigger
        const onDisconnectRef = onDisconnect(this.userStatusDatabaseRef);
        await onDisconnectRef.set({
          state: "offline",
          lastChanged: Date.now(),
        });

        // Then update our presence state to online
        await this.goOnline();
      }
    });

    // We only need to handle before unload to manage offline state when tab closes
    window.addEventListener("beforeunload", this.handleBeforeUnload);
  }

  /**
   * Clean up event listeners
   */
  public cleanup(): void {
    window.removeEventListener("beforeunload", this.handleBeforeUnload);
    this.isSetup = false;
    this.userId = null;
    this.userStatusDatabaseRef = null;
  }

  /**
   * Handle tab close or browser close
   */
  private handleBeforeUnload = async (): Promise<void> => {
    if (this.isSetup && this.userStatusDatabaseRef) {
      // Try to quickly update status before the page unloads
      await this.goOffline();
    }
  };

  /**
   * Update user status to online
   */
  public async goOnline(): Promise<void> {
    if (!this.isSetup || !this.userStatusDatabaseRef || !this.userId) return;

    const status: UserStatus = {
      state: "online",
      lastChanged: Date.now(),
    };

    try {
      // Update in Realtime Database for presence
      await set(this.userStatusDatabaseRef, status);

      // Also update in Firestore for persistence
      await setDoc(
        doc(db, "users", this.userId),
        {
          status: status,
          lastSeen: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (error) {
      console.error("Error updating online status:", error);
    }
  }

  /**
   * Update user status to offline
   */
  public async goOffline(): Promise<void> {
    if (!this.isSetup || !this.userStatusDatabaseRef || !this.userId) return;

    const status: UserStatus = {
      state: "offline",
      lastChanged: Date.now(),
    };

    try {
      // Update in Realtime Database for presence
      await set(this.userStatusDatabaseRef, status);

      // Also update in Firestore for persistence
      await setDoc(
        doc(db, "users", this.userId),
        {
          status: status,
          lastSeen: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (error) {
      console.error("Error updating offline status:", error);
    }
  }
}

// Export as a singleton
export const userPresence = new UserPresence();
