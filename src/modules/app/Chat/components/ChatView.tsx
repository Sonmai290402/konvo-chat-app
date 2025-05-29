import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { Paperclip, Send, SmilePlus } from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/authStore";
import { useConversationStore } from "@/store/conversationStore";
import { useMessageStore } from "@/store/messageStore";

import ChatMessage from "./ChatMessage";

const ChatView = ({ chatId }: { chatId: string }) => {
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  const { user } = useAuthStore();
  const { fetchMessages, messages, sendMessage, markAsRead } =
    useMessageStore();
  const { markConversationAsRead } = useConversationStore();

  // Fetch messages when the component mounts or chatId changes
  useEffect(() => {
    fetchMessages(chatId);
  }, [chatId, fetchMessages]);

  // Use useMemo to prevent unnecessary re-renders
  const chatMessages = useMemo(
    () => messages[chatId] || [],
    [messages, chatId]
  );

  // Scroll to bottom when messages change or component mounts
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView();
  }, [chatMessages, chatId]);

  // Mark messages as read when chat loads (after a delay to ensure user is viewing)
  useEffect(() => {
    if (chatId && user?.id && chatMessages.length > 0) {
      const timer = setTimeout(async () => {
        try {
          await markAsRead(chatId, user.id);
          await markConversationAsRead(chatId, user.id);
        } catch (error) {
          console.error("Failed to mark messages as read on load:", error);
        }
      }, 1000); // 1 second delay

      return () => clearTimeout(timer);
    }
  }, [
    chatId,
    user?.id,
    chatMessages.length,
    markAsRead,
    markConversationAsRead,
  ]);

  // Handle clicking outside emoji picker to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscapeKey);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("keydown", handleEscapeKey);
      };
    }
  }, [showEmojiPicker]);

  const handleEmojiSelect = (emoji: { native: string }) => {
    setMessage((prev) => prev + emoji.native);
    setShowEmojiPicker(false);
  };

  const toggleEmojiPicker = () => {
    setShowEmojiPicker((prev) => !prev);
  };

  const handleInputFocus = async () => {
    if (user?.id) {
      try {
        // Mark messages as read in the message store
        await markAsRead(chatId, user.id);
        // Also mark conversation as read in the conversation store
        await markConversationAsRead(chatId, user.id);
      } catch (error) {
        console.error("Failed to mark messages as read:", error);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const formEvent = new Event("submit", {
        bubbles: true,
        cancelable: true,
      });
      handleSendMessage(formEvent as unknown as React.FormEvent);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !user) return;

    const messageToSend = message.trim();
    // Clear the input immediately for better UX
    setMessage("");

    try {
      // Send message to firestore via the messageStore
      await sendMessage(chatId, messageToSend, user);

      // Scroll to bottom after message is sent
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (error) {
      console.error("Failed to send message:", error);
      // Restore the message if sending failed
      setMessage(messageToSend);
    }
  };

  return (
    <Card className="flex flex-col h-[calc(100vh-60px-16px)] m-2 min-w-0 overflow-hidden">
      <CardContent className="flex flex-col flex-grow p-0 h-full min-w-0">
        <div
          ref={scrollContainerRef}
          className="flex flex-col flex-grow overflow-y-auto px-4 py-2 custom-scrollbar min-w-0"
        >
          <div className={`${chatMessages.length > 6 ? "flex-0" : "flex-1"}`} />

          <div className="flex flex-col gap-4 min-w-0">
            {chatMessages.length > 0 ? (
              chatMessages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} currentUser={user} />
              ))
            ) : (
              <div className="flex items-center justify-center py-10">
                <p className="text-muted-foreground">
                  No messages yet. Start the conversation!
                </p>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        <form
          onSubmit={handleSendMessage}
          className="px-4 pt-2 flex items-center gap-2 relative"
        >
          <div className="relative flex-grow">
            <Input
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={handleInputFocus}
              className="rounded-full pr-20"
            />

            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                className="rounded-full !p-1.5 h-8 w-8"
              >
                <Paperclip className="size-4" />
              </Button>

              <div className="relative">
                <Button
                  type="button"
                  variant="ghost"
                  className="rounded-full !p-1.5 h-8 w-8"
                  onClick={toggleEmojiPicker}
                >
                  <SmilePlus className="size-4" />
                </Button>

                {showEmojiPicker && (
                  <div
                    ref={emojiPickerRef}
                    className="absolute bottom-12 right-1/2 z-50 shadow-lg rounded-lg border bg-background"
                  >
                    <Picker
                      data={data}
                      onEmojiSelect={handleEmojiSelect}
                      theme="light"
                      previewPosition="none"
                      skinTonePosition="none"
                      maxFrequentRows={2}
                      perLine={8}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <Button variant="outline" type="submit" className="rounded-full !p-2">
            <Send className="size-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ChatView;
