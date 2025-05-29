"use client";

import { useParams } from "next/navigation";
import React from "react";

import { Card, CardContent, CardTitle } from "@/components/ui/card";

const UserProfile = () => {
  const params = useParams();
  const { username } = params;
  return (
    <Card className="m-2 h-full max-h-[calc(100vh-16px)] bg-card">
      <CardTitle className="text-center text-2xl font-semibold">
        User Profile
      </CardTitle>
      <CardContent className="flex flex-col items-center gap-4 p-6">
        <div className="bg-primary/10 p-3 rounded-full"></div>
        <h2 className="text-xl font-semibold">{username}</h2>
        <p className="text-muted-foreground">
          User bio or description goes here.
        </p>
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm text-muted-foreground">
            Email: user@example.com
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserProfile;
