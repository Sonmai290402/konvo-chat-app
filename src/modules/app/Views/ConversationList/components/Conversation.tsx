import clsx from "clsx";
import Link from "next/link";
import React from "react";

import { AvatarWithStatus } from "@/components/ui/avatar-with-status";
import { Badge } from "@/components/ui/badge";
import { useTimeAgo, useTimeFormat } from "@/hooks/useTime";
import { useUserStatus } from "@/hooks/useUserTime";
import { useAuthStore } from "@/store/authStore";
import { ConversationData } from "@/types/conversation.types";

const Conversation = ({
  conversation,
  isActive,
}: {
  conversation: ConversationData;
  isActive: boolean;
}) => {
  const { user } = useAuthStore();

  // Get the appropriate display name and avatar based on group status
  const displayName = conversation.isGroup
    ? conversation.groupName || "Group Chat"
    : conversation.displayName;

  const avatarSrc = conversation.isGroup
    ? conversation.groupPhoto
    : conversation.displayAvatar;

  // Use the hook directly at component level
  const lastMessageTime = useTimeAgo(conversation.lastMessage?.createdAt);
  const updatedAtTime = useTimeAgo(conversation.updatedAt);

  // Choose which timestamp to display
  const formattedTime = conversation.lastMessage?.createdAt
    ? lastMessageTime
    : updatedAtTime;

  // Format display text for timestamps
  const displayTime =
    formattedTime === "less than a minute ago" ? "Now" : formattedTime;

  // Get unread count for current user
  const userUnreadCount = user?.id
    ? conversation.unreadCounts?.[user.id] || 0
    : conversation.unreadCount;

  const participantId = conversation.participants?.find(
    (participant) => participant.id !== user?.id
  )?.id;
  const userStatus = useUserStatus(participantId);
  const statusTimeAgo = useTimeFormat(userStatus);
  const statusTime =
    statusTimeAgo === "Just now" ? "Now" : statusTimeAgo.split(" ")[0];

  return (
    <Link
      href={`/chat/${conversation.id}`}
      className={clsx(
        "flex items-center my-2 gap-2 px-2 py-3 rounded-md hover:bg-accent cursor-pointer",
        isActive && "bg-accent",
        userUnreadCount > 0 && "bg-primary/10"
      )}
    >
      <AvatarWithStatus
        src={avatarSrc}
        fallback={displayName}
        status={!conversation.isGroup ? userStatus : null}
        statusTime={
          !conversation.isGroup && userStatus?.state === "offline"
            ? statusTime
            : undefined
        }
        size="md"
      />

      <div className="flex flex-col w-full">
        <div className="flex justify-between items-center">
          <span
            className={clsx(
              userUnreadCount > 0 ? "font-bold" : "font-semibold"
            )}
          >
            {displayName}
          </span>

          <span className="text-sm text-muted-foreground">{displayTime}</span>
        </div>
        <div className="flex justify-between">
          <p
            className={clsx(
              "text-sm text-muted-foreground line-clamp-1",
              userUnreadCount > 0 && "font-medium"
            )}
          >
            {conversation.lastMessage?.content || "No messages yet"}
          </p>
          {userUnreadCount > 0 && (
            <Badge variant="destructive" className="rounded-full">
              {userUnreadCount}
            </Badge>
          )}
        </div>
      </div>
    </Link>
  );
};

export default Conversation;
