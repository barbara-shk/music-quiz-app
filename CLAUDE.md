# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a real-time, multiplayer music quiz game where a game master creates rounds with YouTube/Spotify/Genius content, and teams compete from separate devices. The project uses Socket.io for real-time communication, which requires a custom Next.js server (not Vercel-compatible).

## Commands

### Development
```bash
npm run dev          # Start development server (Next.js + Socket.io on port 3000)
npm run build        # Build Next.js app for production
npm start            # Start production server (requires build first)
npm run lint         # Run ESLint
```

### TypeScript Configurations
- `tsconfig.json`: Client-side Next.js configuration with path aliases (`@/*` → `src/*`)
- `tsconfig.server.json`: Server-side configuration for `server.ts`, extends base config with CommonJS module format

## Architecture

### Custom Server Setup (Critical)

This app uses a **custom Next.js + Socket.io server** (`server.ts`) instead of the default Next.js server. The server:

1. Creates an HTTP server that serves Next.js pages via `app.getRequestHandler()`
2. Attaches Socket.io to the same HTTP server for WebSocket support
3. Manages real-time game sessions with in-memory storage (no database)
4. Cannot be deployed to Vercel (no WebSocket support) - use Railway, Render, or DigitalOcean

The server runs via `ts-node` with `tsconfig-paths` for path alias support (`@/*`).

### Real-time Communication Flow

**Socket.io Event Flow:**
1. **Session Creation**: Game master emits `session:create` → server generates 6-digit code → stores session in `sessionManager` → joins Socket.io room by session ID
2. **Team Join**: Teams emit `session:join` with code → server validates → adds team to session Map → broadcasts `team:joined` to room
3. **Round Lifecycle**:
   - Master emits `round:start` → server sets `timerEndsAt` timestamp → broadcasts `round:started` with server timestamp
   - Server runs interval emitting `round:timer-sync` every second (synchronized across all clients)
   - Teams submit answers via `answer:submit` → validated against `timerEndsAt` before accepting
   - Master emits `round:end` → server clears interval → broadcasts `round:ended`
4. **Scoring**: Master awards points via `score:award` → server updates team's `totalScore` → broadcasts `scores:updated`

**Session Management (`src/lib/game/session-manager.ts`):**
- Singleton class managing in-memory `Map<sessionId, GameSession>`
- Sessions auto-delete after 4 hours via cleanup intervals
- Teams stored as `Map<teamId, Team>` within each session (socket ID used as team ID)
- Master can rejoin sessions (see `session:rejoin-master`) to handle page refreshes

### Client-Side State Architecture

**Zustand Store (`src/stores/gameStore.ts`):**
- Single source of truth for game state on the client
- Mirrors server session structure but with serialized teams (array, not Map)
- Updated by Socket.io event listeners in `useSocket` hook

**Socket Hook (`src/hooks/useSocket.ts`):**
- **Singleton pattern**: Global socket instance shared across all components
- Sets up event listeners once on initialization (`isInitialized` flag)
- Auto-rejoin for masters via localStorage persistence
- Exposes `emit` helper with type-safe event signatures

**Important**: Never create multiple socket connections. The hook uses a global singleton. Components should only call `useSocket()` to get the shared instance.

### Type System

**Core Types (`src/types/game.ts`):**
- `GameSession`: Server-side structure with `teams: Map<string, Team>`
- `SerializedGameSession`: Client-side structure with `teams: Team[]` (for Socket.io serialization)
- `GamePhase`: `'setup' | 'waiting' | 'round-active' | 'round-ended' | 'game-ended'`
- `MediaType`: `'youtube-audio' | 'youtube-video' | 'spotify' | 'genius-lyrics'`

**Socket Events (`src/lib/socket/events.ts`):**
- Fully typed Socket.io interfaces: `ClientToServerEvents`, `ServerToClientEvents`, `SocketData`
- All event handlers in `server.ts` are type-safe via these interfaces

### Game State Machine

```
setup → (master creates rounds)
  ↓ master clicks "Start Game"
waiting → (teams join via code)
  ↓ master starts a round
round-active → (30s countdown, teams submit answers)
  ↓ master ends round
round-ended → (master awards points, can start next round or end game)
  ↓ repeat or master ends game
game-ended → (final scores displayed)
```

**Phase transitions** are controlled by the game master through Socket.io events and managed by `sessionManager.updatePhase()`.

### Timer Synchronization

Timers use **server timestamps** rather than client-side countdowns to ensure synchronization:

1. Server calculates `timerEndsAt = Date.now() + round.timeLimit * 1000`
2. Server broadcasts `round:started` with `timerEndsAt`
3. Server runs interval sending `round:timer-sync` with calculated time remaining every second
4. Clients receive synced time and update UI
5. Server rejects answers submitted after `timerEndsAt`

This prevents cheating via client-side clock manipulation and ensures all devices show the same time.

### Media Integration

**YouTube/Spotify/Genius utilities** (`src/lib/media/*`):
- Extract video/track IDs from URLs
- YouTube uses IFrame Player API (separate handling for audio-only vs video mode)
- Spotify uses oEmbed/embed player
- Genius API for lyrics (requires `GENIUS_API_KEY` env var)

Media playback happens client-side; only metadata (URLs, timestamps) are stored in rounds.

## Important Patterns

### Socket.io Room Pattern
- Each session is a Socket.io room identified by `session.id` (UUID)
- Clients join/leave rooms via `socket.join(sessionId)` / `socket.leave(sessionId)`
- Broadcasts use `io.to(sessionId).emit(...)` to target all clients in the session
- Master gets direct messages via `io.sockets.sockets.get(masterId).emit(...)`

### Role-Based Authorization
Socket events check `socket.data.role` before allowing actions:
```typescript
if (socket.data.role !== 'master') {
  socket.emit('error', 'Unauthorized');
  return;
}
```

### Answer Submission with Time Validation
```typescript
// Server validates answers against server timestamp
if (session.timerEndsAt && Date.now() > session.timerEndsAt) {
  return null; // Reject late submission
}
```

### Master Session Persistence
Masters can reload the page without losing their session:
- Session info stored in localStorage on creation
- On reconnect, socket hook auto-emits `session:rejoin-master`
- Server updates `session.createdBy` to new socket ID

## Environment Variables

```env
GENIUS_API_KEY=        # Optional - for lyrics features
NEXT_PUBLIC_APP_URL=   # App URL for CORS (e.g., http://localhost:3000)
PORT=                  # Server port (default: 3000)
```

## Development Notes

- **Path aliases**: Use `@/` for imports from `src/` (configured in tsconfig `baseUrl` and `paths`)
- **UI components**: Uses shadcn/ui (Radix UI primitives + Tailwind CSS) in `components/ui/`
- **No database**: Sessions exist only in memory (lost on server restart)
- **Session cleanup**: Auto-deleted after 4 hours to prevent memory leaks
- **Socket singleton**: Never call `io()` directly in components; always use `useSocket()` hook
