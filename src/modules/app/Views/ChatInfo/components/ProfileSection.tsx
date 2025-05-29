import React, { useMemo } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { useTimeFormat } from "@/hooks/useTime";
import { useUserStatus } from "@/hooks/useUserTime";
import { ConversationData } from "@/types/conversation.types";
import { UserData } from "@/types/user.types";

interface ProfileSectionProps {
  conversation: ConversationData;
  currentUser: UserData | null;
}

const ProfileSection = ({ conversation, currentUser }: ProfileSectionProps) => {
  // Safely get the first participant (other than the current user)
  const otherParticipant = useMemo((): UserData | null => {
    if (!conversation || !currentUser) return null;
    return (
      conversation.participants?.find((p) => p.id !== currentUser.id) || null
    );
  }, [conversation, currentUser]);

  // Get user status outside of conditional rendering
  const otherUserStatus = useUserStatus(otherParticipant?.id);
  const formattedStatus = useTimeFormat(otherUserStatus);

  return (
    <div className="flex flex-col items-center">
      <Avatar className="h-24 w-24 mb-4">
        <AvatarImage
          src={conversation.displayAvatar}
          alt={conversation.displayName}
        />
        <AvatarFallback className="text-xl">
          {conversation.displayName?.charAt(0) || "C"}
        </AvatarFallback>
      </Avatar>

      <h3 className="text-xl font-semibold mb-1">{conversation.displayName}</h3>

      {!conversation.isGroup && otherParticipant && (
        <p className="text-sm text-muted-foreground">
          {otherParticipant.email}
        </p>
      )}

      {!conversation.isGroup && otherParticipant && (
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <StatusIndicator
            status={otherUserStatus?.state || "offline"}
            className="mr-1"
          />
          <span>{formattedStatus}</span>
        </div>
      )}

      {conversation.isGroup && (
        <div className="text-sm text-muted-foreground">
          {conversation.participants?.length || 0} members
        </div>
      )}
    </div>
  );
};

export default ProfileSection;
