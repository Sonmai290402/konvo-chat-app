import React from "react";

import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/store/authStore";
import { useConversationStore } from "@/store/conversationStore";
import { useViewStore } from "@/store/viewStore";

import ActionButtons from "./components/ActionButtons";
import ControlButtons from "./components/ControlButtons";
import InfoHeader from "./components/InfoHeader";
import MembersList from "./components/MembersList";
import ProfileSection from "./components/ProfileSection";

const ChatInfo = () => {
  const { selectedChatId } = useViewStore();
  const { fetchConversationById } = useConversationStore();
  const { user } = useAuthStore();

  const conversation = selectedChatId
    ? fetchConversationById(selectedChatId)
    : null;

  if (!conversation) {
    return null;
  }

  return (
    <div className="h-full w-full border-l border-border">
      <InfoHeader />
      <Card className="h-full max-h-[calc(100vh-60px-16px)] bg-card m-2">
        <ScrollArea className="h-full max-h-[calc(100vh-60px-16px)]">
          <CardContent className="px-4 space-y-6">
            <ProfileSection conversation={conversation} currentUser={user} />

            <ActionButtons />

            <Separator />

            {conversation.isGroup && (
              <MembersList participants={conversation.participants || []} />
            )}

            <ControlButtons />
          </CardContent>
        </ScrollArea>
      </Card>
    </div>
  );
};

export default ChatInfo;
