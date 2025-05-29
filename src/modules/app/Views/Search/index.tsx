import { collection, getDocs, or, query, where } from "firebase/firestore";
import { Loader2, MessageSquareText } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { db } from "@/lib/firebase";
import { useAuthStore } from "@/store/authStore";
import { useMessageStore } from "@/store/messageStore";
import { UserData } from "@/types/user.types";

const SearchView = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<UserData[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [initialMessage, setInitialMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const { startConversation } = useMessageStore();
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    const searchUsers = async () => {
      if (!searchTerm || searchTerm.length < 3) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);

      try {
        // Create search queries for name and email
        const usersRef = collection(db, "users");
        const searchTermLowerCase = searchTerm.toLowerCase();

        // Search by name or email
        const q = query(
          usersRef,
          or(
            where("name", ">=", searchTermLowerCase),
            where("name", "<=", searchTermLowerCase + "\uf8ff"),
            where("email", ">=", searchTermLowerCase),
            where("email", "<=", searchTermLowerCase + "\uf8ff")
          )
        );

        const querySnapshot = await getDocs(q);
        const results: UserData[] = [];
        querySnapshot.forEach((doc) => {
          const userData = doc.data() as UserData;
          // Don't include current user in search results
          if (userData.id !== user?.id) {
            results.push({
              ...userData,
              id: doc.id, // Ensure ID is from document ID
            });
          }
        });

        setSearchResults(results);
      } catch (error) {
        console.error("Error searching users:", error);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimeout = setTimeout(searchUsers, 500);
    return () => clearTimeout(debounceTimeout);
  }, [searchTerm, user]);

  // Handle sending a message to the selected user
  const handleSendMessage = async () => {
    if (!selectedUser || !user || !initialMessage.trim()) return;

    setIsSending(true);

    try {
      // Start a new conversation or use existing one
      const conversationId = await startConversation(
        [user, selectedUser], // Participants
        initialMessage.trim(), // Initial message
        user, // Sender
        false // Not a group chat
      );

      if (conversationId) {
        // Navigate to the conversation
        router.push(`/chat/${conversationId}`);
      }
    } catch (error) {
      console.error("Error starting conversation:", error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Input
        className="w-full rounded-full"
        placeholder="Search users by name or email..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <ScrollArea className="flex flex-col mt-2 overflow-y-auto flex-grow">
        {isSearching ? (
          <div className="flex justify-center items-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : searchTerm.length < 3 ? (
          <div className="p-4 text-muted-foreground text-center">
            Type at least 3 characters to search for users
          </div>
        ) : searchResults.length === 0 ? (
          <div className="p-4 text-muted-foreground text-center">
            No users found matching &quot;{searchTerm}&quot;
          </div>
        ) : (
          <div className="space-y-2 p-2">
            {searchResults.map((user) => (
              <div
                key={user.id}
                className={`flex items-center p-3 rounded-md hover:bg-accent cursor-pointer ${
                  selectedUser?.id === user.id ? "bg-accent" : ""
                }`}
                onClick={() => setSelectedUser(user)}
              >
                <Avatar className="size-10 mr-3">
                  <AvatarImage src={user.photoURL} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="font-medium">{user.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {user.email}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {selectedUser && (
        <div className="p-4 border-t border-border mt-auto">
          <div className="flex items-center mb-2">
            <Avatar className="size-6 mr-2">
              <AvatarImage src={selectedUser.photoURL} />
              <AvatarFallback>{selectedUser.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <span>
              Send message to <strong>{selectedUser.name}</strong>
            </span>
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Type your message..."
              value={initialMessage}
              onChange={(e) => setInitialMessage(e.target.value)}
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === "Enter" && initialMessage.trim() && !isSending) {
                  handleSendMessage();
                }
              }}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!initialMessage.trim() || isSending}
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <MessageSquareText className="h-4 w-4 mr-1" />
              )}
              Send
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchView;
