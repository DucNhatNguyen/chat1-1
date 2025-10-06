import { formatISO, subMinutes, subHours, subDays } from "date-fns";
import type { Room, User, Message } from "@/types";

const now = new Date();

export const users: User[] = [
  { id: "u1", name: "Alice Ito", avatarUrl: "https://i.pravatar.cc/100?img=1" },
  { id: "u2", name: "Bob Sato", avatarUrl: "https://i.pravatar.cc/100?img=2" },
  { id: "u3", name: "Carol Tanaka", avatarUrl: "https://i.pravatar.cc/100?img=3" },
  { id: "me", name: "You", avatarUrl: "https://i.pravatar.cc/100?img=11" },
];

export const rooms: Room[] = [
  { id: "r1", name: "Project Orion", type: "group", members: ["me", "u1", "u2", "u3"], lastMessageAt: formatISO(subMinutes(now, 5)), unreadCount: 3 },
  { id: "r2", name: "Design Team", type: "group", members: ["me", "u1", "u3"], lastMessageAt: formatISO(subHours(now, 2)), unreadCount: 0 },
  { id: "r3", name: "Bob Sato", type: "direct", members: ["me", "u2"], lastMessageAt: formatISO(subDays(now, 1)), unreadCount: 1 },
];

export const messages: Message[] = [
  { id: "m1", roomId: "r1", userId: "u1", text: "Morning! Standup at 9:30.", createdAt: formatISO(subHours(now, 2)) },
  { id: "m2", roomId: "r1", userId: "me", text: "On it. I’ll share updates.", createdAt: formatISO(subHours(now, 1.8)) },
  { id: "m3", roomId: "r1", userId: "u2", text: "Pushed API changes to staging.", createdAt: formatISO(subMinutes(now, 35)) },
  { id: "m4", roomId: "r2", userId: "u3", text: "New Figma link posted.", createdAt: formatISO(subHours(now, 2.2)) },
  { id: "m5", roomId: "r3", userId: "u2", text: "Can we sync later today?", createdAt: formatISO(subDays(now, 1)) },
];

export const currentUserId = "me";