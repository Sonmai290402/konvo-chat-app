import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuthStore } from "@/store/authStore";

export function useAuthProtection(
  options: {
    redirectTo?: string;
    redirectIfAuthenticated?: boolean;
  } = {}
) {
  const { user, loading, isInitialized } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isInitialized || loading) return;

    if (!user && options.redirectTo) {
      router.replace(options.redirectTo);
    }

    if (user && options.redirectIfAuthenticated) {
      router.replace("/");
    }
  }, [
    user,
    loading,
    isInitialized,
    router,
    options.redirectTo,
    options.redirectIfAuthenticated,
  ]);

  return { user, loading, isInitialized };
}
