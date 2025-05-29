export const firebaseAuthErrors: Record<string, string> = {
  // Email/Password Authentication Errors
  "auth/email-already-in-use":
    "This email address is already in use. Please try another email or log in instead.",
  "auth/user-disabled":
    "This account has been disabled. Please contact support for help.",
  "auth/too-many-requests":
    "Too many unsuccessful login attempts. Please try again later or reset your password.",
  "auth/operation-not-allowed":
    "This operation is not allowed. Please contact support.",

  // Google Sign-in Errors
  "auth/popup-blocked":
    "Sign in popup was blocked by your browser. Please allow popups for this website and try again.",
  "auth/popup-closed-by-user":
    "Sign in popup was closed before completing authentication. Please try again.",
  "auth/unauthorized-domain":
    "This domain is not authorized for OAuth operations. Please contact support.",
  "auth/cancelled-popup-request":
    "The sign in operation was cancelled. Please try again.",

  // General Authentication Errors
  "auth/network-request-failed":
    "A network error occurred. Please check your internet connection and try again.",
  "auth/timeout": "The operation has timed out. Please try again.",
  "auth/invalid-credential":
    "The authentication credential is invalid. Please try again.",
  "auth/invalid-verification-code":
    "The verification code is invalid. Please try again with a valid code.",
  "auth/invalid-verification-id":
    "The verification ID is invalid. Please try again with a valid ID.",
  "auth/missing-verification-code":
    "The verification code is missing. Please provide a verification code.",
  "auth/missing-verification-id":
    "The verification ID is missing. Please provide a verification ID.",
  "auth/provider-already-linked":
    "The provider is already linked to the user account.",
  "auth/requires-recent-login":
    "This operation requires recent authentication. Please log out and log in again before retrying this request.",

  // User Profile Update Errors
  "auth/invalid-photo-url": "The profile photo URL is invalid.",
  "auth/invalid-uid": "The provided user ID is invalid.",
  "auth/uid-already-exists":
    "The provided user ID is already in use by another user.",

  // Session Management Errors
  "auth/session-cookie-expired":
    "The Firebase session cookie has expired. Please sign in again.",
  "auth/session-cookie-revoked":
    "The Firebase session cookie has been revoked. Please sign in again.",
  "auth/id-token-expired":
    "The Firebase ID token has expired. Please sign in again.",
  "auth/id-token-revoked":
    "The Firebase ID token has been revoked. Please sign in again.",

  default: "An error occurred during authentication. Please try again later.",
};

export const getFirebaseErrorMessage = (error: unknown): string => {
  const errorCode = getFirebaseErrorCode(error);

  return errorCode
    ? firebaseAuthErrors[errorCode] || firebaseAuthErrors.default
    : firebaseAuthErrors.default;
};

export const getFirebaseErrorCode = (error: unknown): string | null => {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string" &&
    error.code.startsWith("auth/")
  ) {
    return error.code;
  }
  return null;
};
