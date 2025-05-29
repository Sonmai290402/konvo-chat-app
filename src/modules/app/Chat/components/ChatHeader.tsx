import { motion } from "framer-motion";
import { Info, Phone, Video } from "lucide-react";
import React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { useTimeFormat } from "@/hooks/useTime";
import { useUserStatus } from "@/hooks/useUserTime";
import { useAuthStore } from "@/store/authStore";
import { useConversationStore } from "@/store/conversationStore";
import { useViewStore } from "@/store/viewStore";

const ChatHeader = ({ chatId }: { chatId: string }) => {
  const { fetchConversationById } = useConversationStore();
  const { user } = useAuthStore();
  const { isChatInfoOpen, setChatInfoOpen } = useViewStore();
  const conversation = fetchConversationById(chatId);

  const participantId = conversation?.participants?.find(
    (participant) => participant.id !== user?.id
  )?.id;

  // Get the user status
  const userStatus = useUserStatus(
    conversation?.isGroup ? undefined : participantId
  );

  // Format the status time with our consolidated hook
  const statusTimeAgo = useTimeFormat(userStatus);

  return (
    <motion.div
      className="flex items-center justify-between border-b border-border h-[60px] bg-card px-4"
      layout
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
        duration: 0.3,
      }}
    >
      <div className="flex gap-2">
        <Avatar className="size-10">
          <AvatarImage
            src={conversation?.displayAvatar}
            className="w-full h-full"
          />
          <AvatarFallback className="size-10">
            {conversation?.displayName?.charAt(0) || chatId.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col justify-between">
          <span className="font-semibold">{conversation?.displayName}</span>
          <div className="flex items-center">
            {!conversation?.isGroup && participantId && (
              <>
                <StatusIndicator
                  status={userStatus?.state || "offline"}
                  pulse
                  className="mr-2"
                />
                <span className="text-sm text-muted-foreground">
                  {statusTimeAgo}
                </span>
              </>
            )}

            {conversation?.isGroup && (
              <>
                <StatusIndicator status="online" className="mr-2" />
                <span className="text-sm text-muted-foreground">
                  Group Chat
                </span>
              </>
            )}
            {!conversation?.isGroup && !conversation?.participants?.length && (
              <>
                <StatusIndicator status="offline" className="mr-2" />
                <span className="text-sm text-muted-foreground">Offline</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" className="rounded-full !p-2">
          <Phone className="size-5" />
        </Button>
        <Button variant="ghost" className="rounded-full !p-2">
          <Video className="size-5" />
        </Button>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant={isChatInfoOpen ? "secondary" : "ghost"}
            className={`rounded-full !p-2 transition-colors ${
              isChatInfoOpen ? "bg-primary/10" : ""
            }`}
            onClick={() => setChatInfoOpen(!isChatInfoOpen)}
          >
            <Info
              className={`size-5 ${isChatInfoOpen ? "text-primary" : ""}`}
            />
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ChatHeader;
