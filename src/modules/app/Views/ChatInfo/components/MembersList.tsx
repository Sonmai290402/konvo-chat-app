import { UserRound } from "lucide-react";
import React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserData } from "@/types/user.types";

interface MembersListProps {
  participants: UserData[];
}

const MembersList = ({ participants }: MembersListProps) => {
  if (!participants || participants.length === 0) {
    return null;
  }

  return (
    <div className="mt-6">
      <h4 className="font-medium mb-3 text-sm">Members</h4>
      <div className="space-y-3">
        {participants.map((participant) => {
          return (
            <div key={participant.id} className="flex items-center gap-3">
              <div className="relative">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={participant.photoURL || ""} />
                  <AvatarFallback>
                    <UserRound className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
              </div>
              <div>
                <p className="font-medium">{participant.name}</p>
                <p className="text-xs text-muted-foreground">
                  {participant.email}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MembersList;
