import React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTimeAgo } from "@/hooks/useTime";
import { MessageData } from "@/types/message.types";
import { UserData } from "@/types/user.types";

type ChatMessageProps = {
  message: MessageData;
  currentUser: UserData | null;
};

const ChatMessage = ({ message: msg, currentUser }: ChatMessageProps) => {
  const formattedTime = useTimeAgo(msg.createdAt);

  const isCurrentUserMessage = () => {
    return msg.sender.id === currentUser?.id;
  };

  return (
    <div
      key={msg.id}
      className={`flex min-w-0 ${
        isCurrentUserMessage() ? "justify-end" : "justify-start"
      }`}
    >
      {!isCurrentUserMessage() && (
        <Avatar className="size-8 mr-2 shrink-0">
          <AvatarImage src={msg.sender.photoURL} />
          <AvatarFallback>{msg.sender.name.charAt(0)}</AvatarFallback>
        </Avatar>
      )}

      <div
        className={`max-w-[70%] min-w-0 p-3 rounded-lg ${
          isCurrentUserMessage()
            ? "bg-accent text-accent-foreground"
            : "bg-secondary"
        }`}
      >
        <p className="break-words overflow-wrap-anywhere whitespace-pre-wrap min-w-0">
          {msg.content}
        </p>
        <div className={`text-xs mt-1 text-muted-foreground`}>
          {formattedTime || "Now"}
        </div>
      </div>

      {isCurrentUserMessage() && (
        <Avatar className="size-8 ml-2 shrink-0">
          <AvatarImage src={currentUser?.photoURL} />
          <AvatarFallback>{currentUser?.name?.charAt(0) || "U"}</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};

export default ChatMessage;
