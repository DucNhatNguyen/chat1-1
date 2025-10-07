export type ID = string;

export type User = {
  id: ID;
  name: string;
  avatarUrl?: string;
};

export type Attachment = {
  id: string;
  type: "image" | "video" | "file";
  url: string;
  name?: string;
  size?: number; // bytes
  mimeType?: string;
  width?: number;
  height?: number;
  duration?: number; // seconds
};

export type Message = {
  id: ID;
  roomId: ID;
  userId: ID;
  text: string;
  createdAt: string; // ISO
  reactions?: Record<string, ID[]>; // emoji -> array of userIds
  recalled?: boolean;               // message is recalled (hidden content)
  attachments?: Attachment[]; // optional: media/file đính kèm
};

export type RoomType = "direct" | "group";

export type Room = {
  id: ID;
  name: string;
  type: RoomType;
  members: ID[];
  lastMessageAt?: string;
  unreadCount?: number;
};