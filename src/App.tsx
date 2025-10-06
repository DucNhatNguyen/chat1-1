import { useMemo, useState } from "react";
import { rooms as mockRooms, users as mockUsers, messages as mockMessages, currentUserId } from "./data/mock";
import type { ID, Message, Room, User } from "./types";
import { format, isToday, isYesterday, parseISO } from "date-fns";
import { Sidebar } from "./components/Sidebar";
import { RoomList } from "./components/RoomList";
import { ChatHeader } from "./components/ChatHeader";
import { MessageList } from "./components/MessageList";
import { Composer } from "./components/Composer";
import { RightPanel } from "./components/RightPanel";
import { NewChatModal } from "./components/NewChatModal";

function nextId() {
  return Math.random().toString(36).slice(2, 10);
}

export default function App() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [rooms, setRooms] = useState<Room[]>(mockRooms);
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [selectedRoomId, setSelectedRoomId] = useState<ID>(rooms[0]?.id ?? "");
  const [showRight, setShowRight] = useState(true);
  const [roomFilter, setRoomFilter] = useState("");

  // New chat modal state
  const [newChatOpen, setNewChatOpen] = useState(false);
  const [newChatMode, setNewChatMode] = useState<"direct" | "group">("direct");

  const selectedRoom = useMemo(
    () => rooms.find(r => r.id === selectedRoomId),
    [rooms, selectedRoomId]
  );

  const roomMembers = useMemo(() => {
    if (!selectedRoom) return [] as User[];
    return users.filter(u => selectedRoom.members.includes(u.id));
  }, [users, selectedRoom]);

  const roomMessages = useMemo(() => {
    return messages
      .filter(m => m.roomId === selectedRoomId)
      .sort((a, b) => parseISO(a.createdAt).getTime() - parseISO(b.createdAt).getTime());
  }, [messages, selectedRoomId]);

  function sendMessage(text: string) {
    if (!text.trim() || !selectedRoom) return;
    const newMsg: Message = {
      id: nextId(),
      roomId: selectedRoom.id,
      userId: currentUserId,
      text: text.trim(),
      createdAt: new Date().toISOString(),
      reactions: {},
      recalled: false,
    };
    setMessages(prev => [...prev, newMsg]);

    setRooms(prev =>
      prev.map(r =>
        r.id === selectedRoom.id ? { ...r, lastMessageAt: newMsg.createdAt, unreadCount: 0 } : r
      )
    );
  }

  function formatHeaderSubtitle(dateIso?: string) {
    if (!dateIso) return "";
    const d = parseISO(dateIso);
    if (isToday(d)) return `Last message today at ${format(d, "HH:mm")}`;
    if (isYesterday(d)) return `Last message yesterday at ${format(d, "HH:mm")}`;
    return `Last message ${format(d, "MMM d, HH:mm")}`;
  }

  const filteredRooms = useMemo(() => {
    const q = roomFilter.trim().toLowerCase();
    if (!q) return rooms;
    return rooms.filter(r => r.name.toLowerCase().includes(q));
  }, [rooms, roomFilter]);

  // New: open modals
  function openNewDirect() {
    setNewChatMode("direct");
    setNewChatOpen(true);
  }
  function openNewGroup() {
    setNewChatMode("group");
    setNewChatOpen(true);
  }

  // New: create direct chat (DM). If exists, just select it.
  function createDirectChat(userId: ID) {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    const existing = rooms.find(
      r =>
        r.type === "direct" &&
        r.members.length === 2 &&
        r.members.includes(currentUserId) &&
        r.members.includes(userId)
    );
    if (existing) {
      setSelectedRoomId(existing.id);
      setNewChatOpen(false);
      return;
    }

    const newRoom: Room = {
      id: nextId(),
      name: user.name,
      type: "direct",
      members: [currentUserId, userId],
      unreadCount: 0,
      lastMessageAt: undefined,
    };
    setRooms(prev => [newRoom, ...prev]);
    setSelectedRoomId(newRoom.id);
    setNewChatOpen(false);
  }

  // New: create group chat
  function createGroupChat(name: string, memberIds: ID[]) {
    const uniqueMembers = Array.from(new Set([currentUserId, ...memberIds]));
    const newRoom: Room = {
      id: nextId(),
      name: name.trim() || "New Group",
      type: "group",
      members: uniqueMembers,
      unreadCount: 0,
      lastMessageAt: undefined,
    };
    setRooms(prev => [newRoom, ...prev]);
    setSelectedRoomId(newRoom.id);
    setNewChatOpen(false);
  }

  // New: toggle reaction
  function toggleReaction(messageId: ID, emoji: string) {
    setMessages(prev =>
      prev.map(m => {
        if (m.id !== messageId) return m;
        const reactions = { ...(m.reactions || {}) } as Record<string, ID[]>;
        const arr = new Set(reactions[emoji] || []);
        if (arr.has(currentUserId)) {
          arr.delete(currentUserId);
        } else {
          arr.add(currentUserId);
        }
        const nextArr = Array.from(arr);
        if (nextArr.length === 0) {
          delete reactions[emoji];
        } else {
          reactions[emoji] = nextArr;
        }
        return { ...m, reactions } as Message;
      })
    );
  }

  // New: recall message (only own messages)
  function recallMessage(messageId: ID) {
    setMessages(prev =>
      prev.map(m => (m.id === messageId ? { ...m, recalled: true, text: "" } : m))
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-white text-neutral-900">
      <div
        className={
          showRight
            ? "grid grid-cols-[64px_320px_minmax(0,1fr)_360px] h-full"
            : "grid grid-cols-[64px_320px_minmax(0,1fr)] h-full"
        }
      >
        <Sidebar />

        <aside className="border-r border-neutral-200 bg-neutral-50">
          <RoomList
            rooms={filteredRooms}
            users={users}
            activeRoomId={selectedRoomId}
            onSelectRoom={setSelectedRoomId}
            filter={roomFilter}
            onFilterChange={setRoomFilter}
            onNewDirect={openNewDirect}
            onNewGroup={openNewGroup}
          />
        </aside>

        <main className="flex flex-col">
          {selectedRoom && (
            <>
              <ChatHeader
                title={selectedRoom.name}
                subtitle={formatHeaderSubtitle(selectedRoom.lastMessageAt)}
                onToggleRight={() => setShowRight(s => !s)}
                rightOpen={showRight}
              />
              <div className="flex-1 min-h-0">
                <MessageList
                  messages={roomMessages}
                  users={users}
                  currentUserId={currentUserId}
                  onToggleReaction={toggleReaction}
                  onRecall={recallMessage}
                />
              </div>
              <Composer onSend={sendMessage} />
            </>
          )}
        </main>

        {showRight ? (
          <aside className="border-l border-neutral-200 bg-neutral-50">
            {selectedRoom && (
              <RightPanel room={selectedRoom} members={roomMembers} />
            )}
          </aside>
        ) : null}
      </div>

      <NewChatModal
        open={newChatOpen}
        mode={newChatMode}
        users={users}
        currentUserId={currentUserId}
        onClose={() => setNewChatOpen(false)}
        onCreateDirect={createDirectChat}
        onCreateGroup={createGroupChat}
      />
    </div>
  );
}