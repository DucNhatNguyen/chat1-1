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
  ...Array.from({ length: 47 }, (_, i) => ({
    id: `m2-${i + 1}`,
    roomId: "r1",
    userId: "me",
    text: `On it. I'll share updates. #${i + 1}`,
    createdAt: formatISO(subHours(now, 1.8 - i * 0.02)),
  })),
  { id: "m3", roomId: "r1", userId: "u2", text: "Pushed API changes to staging.", createdAt: formatISO(subMinutes(now, 35)) },
  { id: "m4", roomId: "r2", userId: "u3", text: "New Figma link posted.", createdAt: formatISO(subHours(now, 2.2)) },
  { id: "m5", roomId: "r3", userId: "u2", text: "Can we sync later today?", createdAt: formatISO(subDays(now, 1)) },
  // Mẫu media/image
  {
    id: "m-img-1",
    roomId: "r1",
    userId: "me",
    text: "Ảnh demo",
    attachments: [
      {
        id: "att-img-1",
        type: "image",
        url: "https://picsum.photos/id/237/800/600",
        name: "dog.jpg",
        size: 1200345,
        mimeType: "image/jpeg",
        width: 800,
        height: 600,
      },
    ],
    createdAt: formatISO(subMinutes(now, 25)),
    reactions: {},
    recalled: false,
  },
  // Mẫu video
  {
    id: "m-vid-1",
    roomId: "r1",
    userId: "u2",
    text: "",
    attachments: [
      {
        id: "att-vid-1",
        type: "video",
        url: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
        name: "flower.mp4",
        size: 5_200_000,
        mimeType: "video/mp4",
        duration: 30,
      },
    ],
    createdAt: formatISO(subMinutes(now, 20)),
    reactions: {},
    recalled: false,
  },
  // Mẫu file
  {
    id: "m-file-1",
    roomId: "r1",
    userId: "me",
    text: "File tài liệu",
    attachments: [
      {
        id: "att-file-1",
        type: "file",
        url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        name: "ProjectPlan.pdf",
        size: 210_340,
        mimeType: "application/pdf",
      },
    ],
    createdAt: formatISO(subMinutes(now, 18)),
    reactions: {},
    recalled: false,
  },
];

export const currentUserId = "me";