import { MessageSquare } from "lucide-react";
import React from "react";

import { Card, CardContent } from "../ui/card";

const NoSelectedConversation = () => {
  return (
    <Card className="max-w-md mx-auto">
      <CardContent className="flex flex-col items-center gap-4 text-center p-6">
        <div className="bg-primary/10 p-3 rounded-full">
          <MessageSquare className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-xl font-semibold">Welcome to Konvo Chat</h2>
        <p className="text-muted-foreground">
          Select a conversation from the sidebar to start chatting.
        </p>
      </CardContent>
    </Card>
  );
};

export default NoSelectedConversation;
