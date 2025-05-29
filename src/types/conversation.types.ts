import { MessageData } from "./message.types";
import { UserData } from "./user.types";

export type ConversationData = {
  id: string;
  participants: UserData[];
  participantIds: string[];
  lastMessage?: MessageData;
  unreadCount: number; // Legacy field for backward compatibility
  unreadCounts: Record<string, number>; // Per-participant unread counts
  isGroup: boolean;
  displayName: string;
  displayAvatar?: string;
  groupName?: string;
  groupPhoto?: string;
  createdAt: string;
  updatedAt: string;
};
