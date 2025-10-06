# ChatWork-like UI (React + Vite + Tailwind)

A modern, responsive chat UI inspired by ChatWork, featuring:
- Navigation rail, room list, chat area, right-side info panel
- Message grouping with timestamps
- Message composer with Enter to send
- Mock data with local state management
- Clean Tailwind styling and Lucide icons

## Features you asked for

- New chat buttons:
  - Create DM: pick a single user
  - Create Group: pick multiple users and set group name
- Message actions:
  - Reactions: 👍 ❤️ 😂 🎉 👀
  - Recall (own messages): display “Tin nhắn đã được thu hồi”
  - Copy message text
- Right panel toggle:
  - Hides the right panel and expands the center chat area

## Quickstart

1. Requirements: Node.js 18+
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start dev server:
   ```bash
   npm run dev
   ```
4. Open the printed URL in your browser.

## Project Structure

```
.
├─ index.html
├─ package.json
├─ tailwind.config.ts
├─ postcss.config.js
├─ tsconfig.json
├─ vite.config.ts
└─ src
   ├─ main.tsx
   ├─ index.css
   ├─ types.ts
   ├─ data
   │  └─ mock.ts
   └─ components
      ├─ Sidebar.tsx
      ├─ RoomList.tsx
      ├─ ChatHeader.tsx
      ├─ MessageList.tsx
      ├─ Composer.tsx
      ├─ RightPanel.tsx
      └─ NewChatModal.tsx
```

## Customize

- Replace `src/data/mock.ts` with your backend calls.
- Wire sockets (e.g., Socket.IO) to push new messages into state.
- Add features: read receipts, typing indicators, threads, tasks, file previews.

## Notes

- Tailwind and Lucide are used for quick, consistent UI.
- Date formatting uses date-fns.
- Path aliases `@/*` are enabled via `vite-tsconfig-paths` plugin.