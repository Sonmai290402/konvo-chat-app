import { create } from "zustand";

export type ViewType = "chat" | "contacts" | "search" | "user";

interface ViewState {
  // Main navigation state (synced with URL)
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;

  // Chat view specific states (these don't need URL changes)
  selectedChatId: string | null;
  setSelectedChatId: (id: string | null) => void;

  // UI visibility states
  isUserInfoOpen: boolean;
  setUserInfoOpen: (isOpen: boolean) => void;

  isChatInfoOpen: boolean;
  setChatInfoOpen: (isOpen: boolean) => void;
}

export const useViewStore = create<ViewState>((set) => ({
  // Main navigation state
  activeView: "chat",
  setActiveView: (view) => set({ activeView: view }),

  // Chat specific states
  selectedChatId: null,
  setSelectedChatId: (id) => set({ selectedChatId: id }),

  // UI visibility states
  isUserInfoOpen: false,
  setUserInfoOpen: (isOpen) => set({ isUserInfoOpen: isOpen }),

  isChatInfoOpen: false,
  setChatInfoOpen: (isOpen) => set({ isChatInfoOpen: isOpen }),
}));
