import { deleteCookie, setCookie } from "cookies-next";
import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { toast } from "react-hot-toast";
import { create } from "zustand";
import { persist } from "zustand/middleware";

import { auth, db } from "@/lib/firebase";
import { getFirebaseErrorMessage } from "@/lib/firebaseErrors";
import { UserData } from "@/types/user.types";

type AuthState = {
  user: UserData | null;
  loading: boolean;
  error: string | null;
  isInitialized: boolean;

  signUp: (
    email: string,
    password: string,
    displayName: string
  ) => Promise<void>;
  logInWithGoogle: () => Promise<boolean>;
  logIn: (email: string, password: string) => Promise<boolean>;
  logOut: () => Promise<void>;
};

const AUTH_COOKIE = "auth_token";

// Handle storage functions
const saveUserToCookie = (userData: UserData | null) => {
  try {
    if (userData) {
      const authToken = {
        id: userData.id,
        email: userData.email,
        displayName: userData.name,
        photoURL: userData.photoURL,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
      };
      setCookie(
        AUTH_COOKIE,
        btoa(encodeURIComponent(JSON.stringify(authToken))),
        {
          maxAge: 60 * 60 * 24 * 7,
          path: "/",
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
        }
      );
    } else {
      deleteCookie(AUTH_COOKIE);
    }
  } catch (error) {
    console.error("Error saving cookie:", error);
  }
};

// Create the auth store
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => {
      // Initialize Firebase Auth persistence
      if (typeof window !== "undefined") {
        setPersistence(auth, browserLocalPersistence).catch(console.error);

        // Set up the auth state listener once when the store is created
        onAuthStateChanged(auth, async (user) => {
          if (user) {
            set({ loading: true, error: null });
            try {
              // Get or create user document
              const userDocRef = doc(db, "users", user.uid);
              const userDoc = await getDoc(userDocRef);
              const timestamp = new Date().toISOString();

              let userData: UserData;

              if (userDoc.exists()) {
                userData = userDoc.data() as UserData;
                if (!userData.photoURL && user.photoURL) {
                  userData.photoURL = user.photoURL;
                  await setDoc(userDocRef, userData, { merge: true });
                }
              } else {
                // Create new user
                userData = {
                  id: user.uid,
                  email: user.email || "",
                  name: user.displayName || user.email?.split("@")[0] || "User",
                  username:
                    user.email?.split("@")[0].toLocaleLowerCase() ||
                    `user-${user.uid}`,
                  photoURL: user.photoURL || "/default-avatar.png",
                  status: {
                    state: "online",
                    lastChanged: Date.now(),
                  },
                  lastSeen: timestamp,
                  createdAt: timestamp,
                };
                await setDoc(userDocRef, userData);
              }

              // Update store
              set({
                user: userData,
                loading: false,
                isInitialized: true,
              });

              // Save to cookie
              saveUserToCookie(userData);
            } catch (error) {
              console.error("Error processing auth state:", error);
              set({
                loading: false,
                error: getFirebaseErrorMessage(error),
                isInitialized: true,
              });
            }
          } else {
            // User signed out
            set({ user: null, loading: false, isInitialized: true });
            saveUserToCookie(null);
          }
        });
      }

      return {
        user: null,
        loading: true,
        error: null,
        isInitialized: false,

        signUp: async (email, password, displayName) => {
          set({ loading: true, error: null });
          try {
            // Check if email exists
            const q = query(
              collection(db, "users"),
              where("email", "==", email)
            );
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
              throw new Error("Email already in use");
            }

            // Create user
            const userCredential = await createUserWithEmailAndPassword(
              auth,
              email,
              password
            );
            const newUser = userCredential.user;

            // Update profile
            await updateProfile(newUser, {
              displayName,
              photoURL: newUser.photoURL || "/default-avatar.png",
            });

            // Firebase auth listener will handle the rest
            toast.success("Account created successfully");
          } catch (error) {
            const errorMessage = getFirebaseErrorMessage(error);
            set({ loading: false, error: errorMessage });
            toast.error(errorMessage);
          }
        },

        logIn: async (email, password) => {
          set({ loading: true, error: null });
          try {
            await signInWithEmailAndPassword(auth, email, password);

            // Firebase auth listener will handle the rest
            toast.success("Logged in successfully");
            return true;
          } catch (error) {
            const errorMessage = getFirebaseErrorMessage(error);
            set({ loading: false, error: errorMessage });
            toast.error(errorMessage);
            return false;
          }
        },

        logInWithGoogle: async () => {
          set({ loading: true, error: null });
          try {
            const provider = new GoogleAuthProvider();
            provider.setCustomParameters({ prompt: "select_account" });

            await signInWithPopup(auth, provider);

            // Firebase auth listener will handle the rest
            toast.success("Logged in with Google successfully");
            return false; // Changed from true to avoid any set-password redirect
          } catch (error) {
            const errorMessage = getFirebaseErrorMessage(error);
            set({ loading: false, error: errorMessage });
            toast.error(errorMessage);
            return false;
          }
        },

        logOut: async () => {
          set({ loading: true });
          try {
            const currentUser = auth.currentUser;
            if (currentUser) {
              // Let the userPresence class handle the offline status
              // We don't need to update Firestore, as userPresence will do it
              const { userPresence } = await import("@/utils/userPresence");
              await userPresence.goOffline();
              await userPresence.cleanup();
            }

            await auth.signOut();
            set({ user: null, loading: false, error: null });
            saveUserToCookie(null);
            toast.success("Logged out successfully");

            // Force refresh for clean state
            if (typeof window !== "undefined") {
              window.location.href = "/login";
            }
          } catch (error) {
            const errorMessage = getFirebaseErrorMessage(error);
            set({ loading: false, error: errorMessage });
            toast.error("Failed to log out: " + errorMessage);
          }
        },

        // setPasswordForGoogleUser function removed
      };
    },
    {
      name: "auth-store",
      // Only store the user data, not loading states
      partialize: (state) => ({
        user: state.user,
      }),
      // Using a simplified storage implementation
      storage: {
        getItem: (name) => {
          try {
            const value =
              typeof window !== "undefined" ? localStorage.getItem(name) : null;
            return value ? JSON.parse(value) : null;
          } catch (error) {
            console.error("Storage error:", error);
            return null;
          }
        },
        setItem: (name, value) => {
          try {
            if (typeof window !== "undefined") {
              localStorage.setItem(name, JSON.stringify(value));
            }
          } catch (error) {
            console.error("Storage error:", error);
          }
        },
        removeItem: (name) => {
          try {
            if (typeof window !== "undefined") {
              localStorage.removeItem(name);
            }
          } catch (error) {
            console.error("Storage error:", error);
          }
        },
      },
      skipHydration: true,
    }
  )
);
