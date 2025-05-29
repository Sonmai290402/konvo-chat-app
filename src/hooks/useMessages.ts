import { useEffect } from "react";

import { useMessageStore } from "@/store/messageStore";

export const useMessages = (conversationId?: string) => {
  const { messages, fetchMessages } = useMessageStore();

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    // Set up listener for messages when conversationId is available
    if (conversationId) {
      const setupListener = async () => {
        unsubscribe = await fetchMessages(conversationId);
      };

      setupListener();
    }

    // Cleanup listener when component unmounts or conversationId changes
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [conversationId, fetchMessages]);

  // Return the messages for the current conversation
  return messages[conversationId || ""] || [];
};
