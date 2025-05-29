import { useParams } from "next/navigation";
import React from "react";

import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useConversationStore } from "@/store/conversationStore";

import Conversation from "./components/Conversation";

const ConversationList = () => {
  const params = useParams();
  const id = params?.id as string;
  const { conversations } = useConversationStore();
  const [searchTerm, setSearchTerm] = React.useState("");

  // Sort and filter conversations
  const filteredConversations = React.useMemo(() => {
    // First sort conversations by updatedAt timestamp (newest first)
    const sortedConversations = [...conversations].sort((a, b) => {
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

    // Then filter based on search term if provided
    if (!searchTerm.trim()) return sortedConversations;

    return sortedConversations.filter((conversation) => {
      // For group chats, search by group name
      if (conversation.isGroup) {
        return conversation.groupName
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());
      }
      // For 1-1 chats, search by display name
      return conversation.displayName
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    });
  }, [conversations, searchTerm]);

  return (
    <>
      <Input
        className="w-full rounded-full"
        placeholder="Search conversation by name..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <ScrollArea className="flex flex-col mt-2 overflow-y-auto max-h-[calc(100vh-60px-36px-40px)]">
        {filteredConversations.length > 0 ? (
          filteredConversations.map((conversation) => (
            <Conversation
              key={conversation.id}
              conversation={conversation}
              isActive={conversation.id === id}
            />
          ))
        ) : (
          <div className="flex justify-center items-center p-4 text-muted-foreground">
            No conversations found
          </div>
        )}
      </ScrollArea>
    </>
  );
};

export default ConversationList;
