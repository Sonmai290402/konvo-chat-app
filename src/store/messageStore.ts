import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  Unsubscribe,
  updateDoc,
  where,
} from "firebase/firestore";
import { create } from "zustand";

import { db } from "@/lib/firebase";
import { MessageData, MessageStatus, MessageType } from "@/types/message.types";
import { UserData } from "@/types/user.types";

type MessageState = {
  messages: Record<string, MessageData[]>; // conversationId -> messages
  loading: boolean;
  error: string | null;

  fetchMessages: (conversationId: string) => Promise<Unsubscribe | undefined>;

  sendMessage: (
    conversationId: string,
    content: string,
    sender: UserData,
    type?: MessageType,
    replyToMessageId?: string
  ) => Promise<string | null>;

  markAsRead: (conversationId: string, userId: string) => Promise<void>;

  updateMessageStatus: (
    messageId: string,
    status: MessageStatus
  ) => Promise<void>;

  deleteMessage: (messageId: string) => Promise<void>;

  addReaction: (
    messageId: string,
    emoji: string,
    userId: string
  ) => Promise<void>;

  removeReaction: (messageId: string, userId: string) => Promise<void>;

  startConversation: (
    participants: UserData[],
    initialMessage: string,
    sender: UserData,
    isGroup: boolean,
    groupName?: string,
    groupPhoto?: string
  ) => Promise<string | null>;
};

export const useMessageStore = create<MessageState>((set, get) => ({
  messages: {},
  loading: false,
  error: null,

  fetchMessages: async (conversationId: string) => {
    if (!conversationId) return;

    set({ loading: true, error: null });
    try {
      const messagesRef = collection(db, "messages");
      const q = query(
        messagesRef,
        where("conversationId", "==", conversationId),
        orderBy("createdAt", "asc")
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const messages = snapshot.docs.map((doc) => {
            const data = doc.data();

            const createdAt = data.createdAt?.toDate?.()
              ? data.createdAt.toDate().toISOString()
              : data.createdAt;

            const updatedAt = data.updatedAt?.toDate?.()
              ? data.updatedAt.toDate().toISOString()
              : data.updatedAt;

            return {
              id: doc.id,
              ...data,
              createdAt,
              updatedAt,
            } as MessageData;
          });

          set((state) => ({
            messages: {
              ...state.messages,
              [conversationId]: messages,
            },
            loading: false,
          }));
        },
        (error) => {
          console.error("Error fetching messages:", error);
          set({ loading: false, error: error.message });
        }
      );

      return unsubscribe;
    } catch (error: Error | unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error("Error setting up message listener:", error);
      set({ loading: false, error: errorMessage });
    }
  },

  sendMessage: async (
    conversationId,
    content,
    sender,
    type = "text",
    replyToMessageId
  ) => {
    set({ loading: true, error: null });
    try {
      let replyToMessage: MessageData | undefined;

      if (replyToMessageId) {
        const messageRef = doc(db, "messages", replyToMessageId);
        const messageDoc = await getDoc(messageRef);
        if (messageDoc.exists()) {
          replyToMessage = {
            id: messageDoc.id,
            ...messageDoc.data(),
          } as MessageData;
        }
      }

      const messageRef = collection(db, "messages");
      const message = {
        conversationId,
        sender,
        content,
        type,
        createdAt: new Date().toISOString(),
        status: "sent" as MessageStatus,
        reactions: [],
        ...(replyToMessage && { replyTo: replyToMessage }),
      };

      const docRef = await addDoc(messageRef, message);

      // Get current conversation data to update unread counts
      const conversationRef = doc(db, "conversations", conversationId);
      const conversationDoc = await getDoc(conversationRef);

      if (conversationDoc.exists()) {
        const conversationData = conversationDoc.data();
        const participantIds = conversationData.participantIds || [];
        const currentUnreadCounts = conversationData.unreadCounts || {};

        // Increment unread count for all participants except the sender
        const updatedUnreadCounts = { ...currentUnreadCounts };
        participantIds.forEach((participantId: string) => {
          if (participantId !== sender.id) {
            updatedUnreadCounts[participantId] =
              (updatedUnreadCounts[participantId] || 0) + 1;
          }
        });

        // Calculate total unread count for backward compatibility
        const totalUnreadCount = Object.values(updatedUnreadCounts).reduce(
          (sum: number, count) => sum + (count as number),
          0
        );

        await updateDoc(conversationRef, {
          lastMessage: {
            id: docRef.id,
            content,
            createdAt: new Date().toISOString(),
          },
          updatedAt: new Date().toISOString(),
          unreadCounts: updatedUnreadCounts,
          unreadCount: totalUnreadCount,
        });
      }

      set({ loading: false });
      return docRef.id;
    } catch (error: Error | unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error("Error sending message:", error);
      set({ loading: false, error: errorMessage });
      return null;
    }
  },

  markAsRead: async (conversationId: string, userId: string) => {
    set({ loading: true, error: null });
    try {
      const conversationRef = doc(db, "conversations", conversationId);
      const conversationDoc = await getDoc(conversationRef);

      if (conversationDoc.exists()) {
        const conversationData = conversationDoc.data();
        const participantIds = conversationData.participantIds || [];
        const currentUnreadCounts = conversationData.unreadCounts || {};

        // If the user is a participant, clear their unread count
        if (participantIds.includes(userId)) {
          const updatedUnreadCounts = { ...currentUnreadCounts, [userId]: 0 };

          // Calculate total unread count for backward compatibility
          const totalUnreadCount = Object.values(updatedUnreadCounts).reduce(
            (sum: number, count) => sum + (count as number),
            0
          );

          await updateDoc(conversationRef, {
            unreadCounts: updatedUnreadCounts,
            unreadCount: totalUnreadCount,
          });
        }
      }

      set({ loading: false });
    } catch (error: Error | unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error("Error marking messages as read:", error);
      set({ loading: false, error: errorMessage });
    }
  },

  updateMessageStatus: async (messageId: string, status: MessageStatus) => {
    try {
      const messageRef = doc(db, "messages", messageId);
      await updateDoc(messageRef, {
        status,
        updatedAt: new Date().toISOString(),
      });
    } catch (error: Error | unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error("Error updating message status:", error);
      set({ error: errorMessage });
    }
  },

  deleteMessage: async (messageId: string) => {
    try {
      const messageRef = doc(db, "messages", messageId);

      await updateDoc(messageRef, {
        isDeleted: true,
        content: "This message was deleted",
        updatedAt: new Date().toISOString(),
      });
    } catch (error: Error | unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error("Error deleting message:", error);
      set({ error: errorMessage });
    }
  },

  addReaction: async (messageId: string, emoji: string, userId: string) => {
    try {
      const messageRef = doc(db, "messages", messageId);
      const messageDoc = await getDoc(messageRef);

      if (messageDoc.exists()) {
        const data = messageDoc.data();
        const reactions = data.reactions || [];

        const filteredReactions = reactions.filter(
          (r: { userId: string }) => r.userId !== userId
        );

        filteredReactions.push({ emoji, userId });

        await updateDoc(messageRef, {
          reactions: filteredReactions,
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (error: Error | unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error("Error adding reaction:", error);
      set({ error: errorMessage });
    }
  },

  removeReaction: async (messageId: string, userId: string) => {
    try {
      const messageRef = doc(db, "messages", messageId);
      const messageDoc = await getDoc(messageRef);

      if (messageDoc.exists()) {
        const data = messageDoc.data();
        const reactions = data.reactions || [];

        const filteredReactions = reactions.filter(
          (r: { userId: string }) => r.userId !== userId
        );

        await updateDoc(messageRef, {
          reactions: filteredReactions,
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (error: Error | unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error("Error removing reaction:", error);
      set({ error: errorMessage });
    }
  },

  startConversation: async (
    participants: UserData[],
    initialMessage: string,
    sender: UserData,
    isGroup: boolean,
    groupName?: string,
    groupPhoto?: string
  ) => {
    set({ loading: true, error: null });
    try {
      const participantIds = participants.map((p) => p.id);

      // Check if a conversation already exists between these users (for 1-1 chats)
      let existingConversationId: string | null = null;

      if (!isGroup && participants.length === 2) {
        const conversationsRef = collection(db, "conversations");
        const q = query(
          conversationsRef,
          where("participantIds", "array-contains", sender.id),
          where("isGroup", "==", false)
        );

        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const otherParticipantId = participants.find(
            (p) => p.id !== sender.id
          )?.id;

          if (data.participantIds.includes(otherParticipantId)) {
            existingConversationId = doc.id;
          }
        });

        if (existingConversationId) {
          await get().sendMessage(
            existingConversationId,
            initialMessage,
            sender
          );
          set({ loading: false });
          return existingConversationId;
        }
      }

      const conversationData = {
        participants,
        participantIds,
        isGroup,
        unreadCount: 0,
        unreadCounts: participantIds.reduce(
          (acc: Record<string, number>, id: string) => {
            acc[id] = 0;
            return acc;
          },
          {}
        ),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Add group properties if it's a group chat
      if (isGroup) {
        Object.assign(conversationData, {
          groupName: groupName || "New Group",
          groupPhoto: groupPhoto,
        });
      }

      const conversationRef = collection(db, "conversations");
      const docRef = await addDoc(conversationRef, conversationData);

      await get().sendMessage(docRef.id, initialMessage, sender);

      set({ loading: false });
      return docRef.id;
    } catch (error: Error | unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error("Error starting conversation:", error);
      set({ loading: false, error: errorMessage });
      return null;
    }
  },
}));
