import { Phone, User, Video } from "lucide-react";
import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useConversationStore } from "@/store/conversationStore";
import { useViewStore } from "@/store/viewStore";

const ActionButtons = () => {
  const { selectedChatId } = useViewStore();
  const { fetchConversationById } = useConversationStore();
  const [isCallDialogOpen, setIsCallDialogOpen] = useState(false);
  const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false);

  const conversation = selectedChatId
    ? fetchConversationById(selectedChatId)
    : null;

  const handleCall = () => {
    setIsCallDialogOpen(true);
  };

  const handleVideo = () => {
    setIsVideoDialogOpen(true);
  };

  return (
    <>
      <div className="flex justify-around">
        <Button
          variant="ghost"
          className="flex flex-col items-center gap-1 h-auto py-3"
          onClick={handleCall}
        >
          <Phone className="size-5 mb-1" />
          <span className="text-xs">Call</span>
        </Button>
        <Button
          variant="ghost"
          className="flex flex-col items-center gap-1 h-auto py-3"
          onClick={handleVideo}
        >
          <Video className="size-5 mb-1" />
          <span className="text-xs">Video</span>
        </Button>
        <Button
          variant="ghost"
          className="flex flex-col items-center gap-1 h-auto py-3"
        >
          <User className="size-5 mb-1" />
          <span className="text-xs">Profile</span>
        </Button>
      </div>

      <Dialog open={isCallDialogOpen} onOpenChange={setIsCallDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start a call</DialogTitle>
            <DialogDescription>
              {conversation
                ? `Calling ${conversation.displayName}...`
                : "Initializing call..."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center py-6">
            <Phone className="h-20 w-20 text-primary animate-pulse" />
          </div>
          <Button
            variant="destructive"
            onClick={() => {
              setIsCallDialogOpen(false);
            }}
          >
            End Call
          </Button>
        </DialogContent>
      </Dialog>

      {/* Video Dialog */}
      <Dialog open={isVideoDialogOpen} onOpenChange={setIsVideoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Video Call</DialogTitle>
            <DialogDescription>
              {conversation
                ? `Video calling ${conversation.displayName}...`
                : "Initializing video call..."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center py-6">
            <Video className="h-20 w-20 text-primary animate-pulse" />
          </div>
          <Button
            variant="destructive"
            onClick={() => {
              setIsVideoDialogOpen(false);
            }}
          >
            End Video Call
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ActionButtons;
