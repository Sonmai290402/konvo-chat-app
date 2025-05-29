export type UserStatus = {
  state: "online" | "offline";
  lastChanged: number;
};

export type UserData = {
  id: string;
  email: string;
  name: string;
  username: string;
  photoURL?: string;
  status?: UserStatus;
  lastSeen?: string;
  createdAt?: string;
};
