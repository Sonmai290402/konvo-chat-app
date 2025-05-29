import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect } from "react";

import { db } from "@/lib/firebase";
import { useConversationStore } from "@/store/conversationStore";
import { ConversationData } from "@/types/conversation.types";
import { UserData } from "@/types/user.types";

export const useConversationListener = (userId?: string) => {
  const { setConversations } = useConversationStore();

  useEffect(() => {
    if (!userId) return;

    const unsub = onSnapshot(
      query(
        collection(db, "conversations"),
        where("participantIds", "array-contains", userId)
      ),
      (snapshot) => {
        const convs = snapshot.docs.map((doc) => {
          const data = doc.data();

          // Get the basic conversation data from Firestore
          const conversationData = {
            id: doc.id,
            ...data,
          } as ConversationData;

          // Calculate display properties
          if (!conversationData.displayName) {
            conversationData.displayName = conversationData.isGroup
              ? conversationData.groupName || "Group Chat"
              : conversationData.participants.find(
                  (p: UserData) => p.id !== userId
                )?.name || "Unknown";
          }

          if (!conversationData.displayAvatar) {
            conversationData.displayAvatar = conversationData.isGroup
              ? conversationData.groupPhoto
              : conversationData.participants.find(
                  (p: UserData) => p.id !== userId
                )?.photoURL;
          }

          return conversationData;
        }) as ConversationData[];

        setConversations(convs);
      }
    );

    return () => unsub();
  }, [userId, setConversations]);
};
