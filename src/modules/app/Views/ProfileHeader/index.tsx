import { SquarePen } from "lucide-react";
import React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";

const ProfileHeader = () => {
  const { user } = useAuthStore();

  return (
    <div className="flex h-[60px] px-4 items-center justify-between border-b border-border bg-card">
      <div className="flex items-center gap-2">
        <Avatar className="size-10">
          <AvatarImage
            src={user?.photoURL}
            alt={user?.name}
            className="h-full w-full"
          />
          <AvatarFallback className="h-full w-full">
            {user?.name?.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <span className="font-semibold">{user?.name}</span>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full relative hover:bg-primary/10"
      >
        <SquarePen className="size-5" />
      </Button>
    </div>
  );
};

export default ProfileHeader;
