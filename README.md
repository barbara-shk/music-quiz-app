# Blind Test - Music Quiz Game

A real-time, multiplayer music quiz game where a game master creates rounds with YouTube/Spotify/Genius content, and teams compete from separate devices.

## Features

- Real-time multiplayer using Socket.io
- Game master creates and controls quiz rounds
- Teams join via 6-digit codes
- Support for multiple media types:
  - YouTube audio
  - YouTube video (muted)
  - Spotify tracks
  - Genius lyrics
- 30-second countdown timer synced across devices
- Free-text or multiple-choice answers
- Real-time scoring and leaderboard

## Tech Stack

- **Framework**: Next.js 14+ with TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Real-time**: Socket.io (custom Next.js server)
- **State Management**: Zustand
- **Media APIs**: YouTube IFrame API, Spotify Embed, Genius Lyrics API

## Setup

### Prerequisites

- Node.js 18+ and npm
- (Optional) Genius API key for lyrics features

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env.local` file:
```env
GENIUS_API_KEY=your_genius_api_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
PORT=3000
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Development Status

### ✅ Completed

- Project setup with Next.js, TypeScript, and Tailwind CSS
- Socket.io server with custom Next.js server
- Complete type definitions for game entities
- In-memory session manager
- Zustand store for client-side state
- Socket.io client hook with event handling
- Timer synchronization utilities
- Landing page with role selection
- Game master session creation page
- Project folder structure
- YouTube, Spotify, and Genius utilities

### 🚧 In Progress

- Game master dashboard (round builder, game controller, team management)
- Team interface (join, play, scoreboard)
- Media player components

## Project Structure

```
music-quiz-app/
├── server.ts                    # Custom Next.js + Socket.io server
├── src/
│   ├── types/game.ts           # Core type definitions
│   ├── lib/
│   │   ├── game/session-manager.ts  # In-memory session storage
│   │   ├── socket/events.ts    # Socket.io event types
│   │   ├── media/              # YouTube, Spotify, Genius utilities
│   │   └── utils/session-code.ts
│   ├── stores/gameStore.ts     # Zustand state management
│   ├── hooks/
│   │   ├── useSocket.ts        # Socket.io client hook
│   │   └── useTimer.ts         # Timer utilities
│   └── components/             # UI components
├── app/
│   ├── page.tsx                # Landing page
│   ├── master/                 # Game master interface
│   └── team/                   # Team interface
└── components/ui/              # shadcn/ui components
```

## How It Works

### Session Creation
1. Game master navigates to `/master`
2. Creates a new session, receives a 6-digit code
3. Teams join using the code at `/team`

### Game Flow
1. **Setup**: Game master creates all quiz rounds
2. **Waiting**: Teams join the session
3. **Round Active**: Game master starts a round, teams submit answers within 30 seconds
4. **Round Ended**: Game master reviews answers and awards points
5. **Game Ended**: Final scores displayed

### Real-time Communication
- Socket.io manages bi-directional communication
- Rooms isolate game sessions
- Events sync state across all devices
- Timer synchronized via server timestamps

## Deployment

This app requires WebSocket support. Recommended platforms:

- **Railway**: Deploy with one click
- **Render**: Connect GitHub repo, use `npm run build` and `npm start`
- **DigitalOcean App Platform**

**Note**: Cannot be deployed to Vercel (no WebSocket support in serverless functions)

## Environment Variables

```env
GENIUS_API_KEY=        # Optional - for lyrics features
NEXT_PUBLIC_APP_URL=   # Your app URL (e.g., http://localhost:3000)
PORT=                  # Port number (default: 3000)
```

## Next Steps

To complete the implementation:

1. Build remaining UI components (in progress)
2. Add comprehensive error handling
3. Test cross-device functionality
4. Add mobile-optimized styling
5. Deploy to production

## License

MIT
