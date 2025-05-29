import React from "react";

import NoSelectedConversation from "@/components/empty-states/NoSelectedConversation";

const ChatPage = () => {
  return (
    <div className="flex items-center justify-center h-full">
      <NoSelectedConversation />
    </div>
  );
};

export default ChatPage;
