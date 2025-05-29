"use client";

import Image from "next/image";
import React from "react";

import { useAuthProtection } from "@/hooks/useAuthListener";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading, isInitialized } = useAuthProtection({
    redirectIfAuthenticated: true,
  });

  if (isInitialized || !loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center relative">
        <div className="absolute inset-0 w-full h-full z-0">
          <Image
            src="/auth-bg.png"
            alt="Authentication background"
            fill
            priority
            className="object-cover"
          />
        </div>

        <div className="z-10 w-full grid grid-cols-2 gap-4">
          <>{children}</>
          <div className="flex flex-col items-center justify-center">
            <Image
              src="/konvo-logo.png"
              alt="Konvo logo"
              width={500}
              height={500}
              className="w-1/2 h-auto mb-4"
            />
            <h2 className="text-center text-3xl font-bold text-accent-foreground">
              Join Konvo Chat To Connect With Your Friends.
            </h2>
          </div>
        </div>
      </div>
    );
  }
}
