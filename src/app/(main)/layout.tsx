"use client";

import { Loader } from "lucide-react";

import SideBar from "@/components/layout/SideBar";
import { useAuthProtection } from "@/hooks/useAuthListener";
import { useConversationListener } from "@/hooks/useConversationListener";
import { useUserPresence } from "@/hooks/useUserTime";
import Views from "@/modules/app/Views";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, isInitialized } = useAuthProtection({
    redirectTo: "/login",
  });

  useConversationListener(user?.id);
  useUserPresence(user?.id);

  if (!isInitialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size={30} className="animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="grid h-screen overflow-hidden bg-background grid-cols-[4rem_20rem_1fr]">
      <SideBar />
      <Views />
      <div className="min-w-0 overflow-hidden">{children}</div>
    </div>
  );
}
