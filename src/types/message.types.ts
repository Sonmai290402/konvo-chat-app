import { UserData } from "./user.types";

export type MessageType = "text" | "image" | "video" | "file" | "audio";
export type MessageStatus = "sending" | "sent" | "delivered" | "read";

export type Reaction = {
  emoji: string;
  userId: string;
};

export type MessageData = {
  id: string;
  conversationId: string;
  sender: UserData;
  content: string;
  type: MessageType;
  createdAt: string;
  updatedAt?: string;
  status: MessageStatus;
  reactions: Reaction[];
  replyTo?: MessageData;
  isDeleted?: boolean;
  isEdited?: boolean;
};
