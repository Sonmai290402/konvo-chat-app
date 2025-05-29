import { doc, updateDoc } from "firebase/firestore";
import { create } from "zustand";

import { db } from "@/lib/firebase";
import { ConversationData } from "@/types/conversation.types";

type ConversationState = {
  conversations: ConversationData[];
  activeConversationId: string | null;

  setConversations: (conversations: ConversationData[]) => void;
  addConversation: (conversation: ConversationData) => void;
  updateConversation: (
    conversationId: string,
    updatedData: Partial<ConversationData>
  ) => void;
  removeConversation: (conversationId: string) => void;
  fetchConversationById: (id: string) => ConversationData | undefined;
  markConversationAsRead: (
    conversationId: string,
    userId: string
  ) => Promise<void>;

  setActiveConversation: (id: string | null) => void;
};

export const useConversationStore = create<ConversationState>((set, get) => ({
  conversations: [],
  activeConversationId: null,

  setConversations: (conversations) => set({ conversations }),
  addConversation: (conversation) =>
    set((state) => ({
      conversations: [...state.conversations, conversation],
    })),
  updateConversation: (conversationId, updatedData) =>
    set((state) => ({
      conversations: state.conversations.map((conversation) =>
        conversation.id === conversationId
          ? { ...conversation, ...updatedData }
          : conversation
      ),
    })),
  removeConversation: (conversationId) =>
    set((state) => ({
      conversations: state.conversations.filter(
        (conversation) => conversation.id !== conversationId
      ),
    })),
  fetchConversationById: (id) => {
    const { conversations } = get();
    return conversations.find((conversation) => conversation.id === id);
  },
  markConversationAsRead: async (conversationId: string, userId: string) => {
    try {
      const conversationRef = doc(db, "conversations", conversationId);
      const conversation = get().fetchConversationById(conversationId);

      if (conversation && conversation.unreadCounts) {
        const updatedUnreadCounts = { ...conversation.unreadCounts };
        updatedUnreadCounts[userId] = 0;

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
    } catch (error) {
      console.error("Error marking conversation as read:", error);
    }
  },

  setActiveConversation: (id) => set({ activeConversationId: id }),
}));
