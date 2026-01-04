import { createServer } from 'http';
import next from 'next';
import { Server as SocketIOServer } from 'socket.io';
import { sessionManager } from './src/lib/game/session-manager';
import type {
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents,
  SocketData,
} from './src/lib/socket/events';
import type { Team } from './src/types/game';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const PORT = process.env.PORT || 3000;

app.prepare().then(() => {
  const server = createServer((req, res) => {
    handle(req, res);
  });

  const io = new SocketIOServer<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >(server, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || `http://localhost:${PORT}`,
      methods: ['GET', 'POST'],
    },
  });

  const timerIntervals = new Map<string, NodeJS.Timeout>();

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('session:rejoin-master', (sessionId) => {
      try {
        const session = sessionManager.getSession(sessionId);
        if (!session) {
          socket.emit('error', 'Session not found');
          return;
        }

        socket.data.sessionId = sessionId;
        socket.data.role = 'master';
        socket.join(sessionId);

        // Update the master socket ID so answers can be delivered
        sessionManager.updateMasterId(sessionId, socket.id);

        const serialized = sessionManager.serializeSession(session);
        socket.emit('session:updated', serialized);

        console.log(`Master rejoined session ${sessionId} with new socket ID ${socket.id}`);
      } catch (error) {
        console.error('Error rejoining session:', error);
        socket.emit('error', 'Failed to rejoin session');
      }
    });

    socket.on('session:create', (masterName, useBigScreen) => {
      try {
        const session = sessionManager.createSession(socket.id, useBigScreen);
        socket.data.sessionId = session.id;
        socket.data.role = 'master';

        socket.join(session.id);
        socket.emit('session:created', { code: session.code, sessionId: session.id });

        // Send full session state to master
        const serialized = sessionManager.serializeSession(session);
        socket.emit('session:updated', serialized);

        console.log(`Master ${masterName} created session ${session.id} (Big Screen: ${useBigScreen})`);
      } catch (error) {
        console.error('Error creating session:', error);
        socket.emit('error', 'Failed to create session');
      }
    });

    socket.on('session:join', (code, teamData) => {
      try {
        const session = sessionManager.getSessionByCode(code);
        if (!session) {
          socket.emit('error', 'Invalid session code');
          return;
        }

        if (session.phase !== 'setup' && session.phase !== 'waiting') {
          socket.emit('error', 'Game already in progress');
          return;
        }

        const team: Team = {
          id: socket.id,
          name: teamData.name,
          members: teamData.members,
          totalScore: 0,
          answers: [],
          joinedAt: Date.now(),
          connected: true,
        };

        sessionManager.addTeam(session.id, team);
        socket.data.sessionId = session.id;
        socket.data.teamId = team.id;
        socket.data.role = 'team';

        socket.join(session.id);
        io.to(session.id).emit('team:joined', team);

        const serialized = sessionManager.serializeSession(session);
        socket.emit('session:updated', { ...serialized, myTeamId: team.id } as any);

        console.log(`Team ${team.name} joined session ${session.id}`);
      } catch (error) {
        console.error('Error joining session:', error);
        socket.emit('error', 'Failed to join session');
      }
    });

    socket.on('session:join-bigscreen', (sessionId) => {
      try {
        const session = sessionManager.getSession(sessionId);
        if (!session) {
          socket.emit('error', 'Session not found');
          return;
        }

        socket.data.sessionId = sessionId;
        socket.data.role = 'big-screen';
        socket.join(sessionId);

        const serialized = sessionManager.serializeSession(session);
        socket.emit('session:updated', serialized);

        console.log(`Big screen joined session ${sessionId}`);
      } catch (error) {
        console.error('Error joining big screen:', error);
        socket.emit('error', 'Failed to join session');
      }
    });

    socket.on('session:leave', () => {
      const sessionId = socket.data.sessionId;
      const teamId = socket.data.teamId;

      if (sessionId && teamId) {
        sessionManager.removeTeam(sessionId, teamId);
        io.to(sessionId).emit('team:left', teamId);
        socket.leave(sessionId);
        console.log(`Team ${teamId} left session ${sessionId}`);
      }
    });

    socket.on('round:create', (round) => {
      const sessionId = socket.data.sessionId;
      if (!sessionId || socket.data.role !== 'master') {
        socket.emit('error', 'Unauthorized');
        return;
      }

      const session = sessionManager.getSession(sessionId);
      if (!session) {
        socket.emit('error', 'Session not found');
        return;
      }

      const newRound = sessionManager.addRound(sessionId, round);
      if (newRound) {
        const serialized = sessionManager.serializeSession(session);
        io.to(sessionId).emit('session:updated', serialized);
      }
    });

    socket.on('round:update', (roundId, updates) => {
      const sessionId = socket.data.sessionId;
      if (!sessionId || socket.data.role !== 'master') {
        socket.emit('error', 'Unauthorized');
        return;
      }

      const success = sessionManager.updateRound(sessionId, roundId, updates);
      if (success) {
        const session = sessionManager.getSession(sessionId);
        if (session) {
          const serialized = sessionManager.serializeSession(session);
          io.to(sessionId).emit('session:updated', serialized);
        }
      }
    });

    socket.on('round:delete', (roundId) => {
      const sessionId = socket.data.sessionId;
      if (!sessionId || socket.data.role !== 'master') {
        socket.emit('error', 'Unauthorized');
        return;
      }

      const success = sessionManager.deleteRound(sessionId, roundId);
      if (success) {
        const session = sessionManager.getSession(sessionId);
        if (session) {
          const serialized = sessionManager.serializeSession(session);
          io.to(sessionId).emit('session:updated', serialized);
        }
      }
    });

    socket.on('round:start', (roundIndex) => {
      const sessionId = socket.data.sessionId;
      if (!sessionId || socket.data.role !== 'master') {
        socket.emit('error', 'Unauthorized');
        return;
      }

      const result = sessionManager.startRound(sessionId, roundIndex);
      if (!result) {
        socket.emit('error', 'Failed to start round');
        return;
      }

      const { round, timerEndsAt } = result;
      io.to(sessionId).emit('round:started', round, timerEndsAt);

      const existingInterval = timerIntervals.get(sessionId);
      if (existingInterval) {
        clearInterval(existingInterval);
      }

      const interval = setInterval(() => {
        const timeRemaining = Math.max(0, Math.floor((timerEndsAt - Date.now()) / 1000));
        io.to(sessionId).emit('round:timer-sync', timeRemaining);

        if (timeRemaining <= 0) {
          clearInterval(interval);
          timerIntervals.delete(sessionId);
        }
      }, 1000);

      timerIntervals.set(sessionId, interval);
    });

    socket.on('round:end', () => {
      const sessionId = socket.data.sessionId;
      if (!sessionId || socket.data.role !== 'master') {
        socket.emit('error', 'Unauthorized');
        return;
      }

      const existingInterval = timerIntervals.get(sessionId);
      if (existingInterval) {
        clearInterval(existingInterval);
        timerIntervals.delete(sessionId);
      }

      const scores = sessionManager.endRound(sessionId);
      if (scores) {
        io.to(sessionId).emit('round:ended', scores);
      }
    });

    socket.on('answer:reveal', (roundId) => {
      const sessionId = socket.data.sessionId;
      if (!sessionId || socket.data.role !== 'master') {
        socket.emit('error', 'Unauthorized');
        return;
      }

      const session = sessionManager.getSession(sessionId);
      if (!session) {
        socket.emit('error', 'Session not found');
        return;
      }

      const round = session.rounds.find((r) => r.id === roundId);
      if (!round) {
        socket.emit('error', 'Round not found');
        return;
      }

      io.to(sessionId).emit('answer:revealed', roundId, round.correctAnswer);
      console.log(`Answer revealed for round ${roundId} in session ${sessionId}`);
    });

    socket.on('answer:submit', (roundId, answer) => {
      const sessionId = socket.data.sessionId;
      const teamId = socket.data.teamId;

      if (!sessionId || !teamId || socket.data.role !== 'team') {
        socket.emit('error', 'Unauthorized');
        return;
      }

      const teamAnswer = sessionManager.submitAnswer(sessionId, teamId, roundId, answer);
      if (teamAnswer) {
        const masterSocket = io.sockets.sockets.get(
          sessionManager.getSession(sessionId)?.createdBy || ''
        );
        if (masterSocket) {
          masterSocket.emit('answer:submitted', teamId, teamAnswer);
        }

        socket.emit('answer:submitted', teamId, teamAnswer);
      } else {
        socket.emit('error', 'Failed to submit answer (time may have expired)');
      }
    });

    socket.on('score:award', (teamId, roundId, points) => {
      const sessionId = socket.data.sessionId;
      if (!sessionId || socket.data.role !== 'master') {
        socket.emit('error', 'Unauthorized');
        return;
      }

      const success = sessionManager.awardPoints(sessionId, teamId, roundId, points);
      if (success) {
        const scores = sessionManager.getScores(sessionId);
        io.to(sessionId).emit('scores:updated', scores);
      }
    });

    socket.on('game:start', () => {
      const sessionId = socket.data.sessionId;
      if (!sessionId || socket.data.role !== 'master') {
        socket.emit('error', 'Unauthorized');
        return;
      }

      sessionManager.updatePhase(sessionId, 'waiting');
      io.to(sessionId).emit('game:started');
    });

    socket.on('game:end', () => {
      const sessionId = socket.data.sessionId;
      if (!sessionId || socket.data.role !== 'master') {
        socket.emit('error', 'Unauthorized');
        return;
      }

      sessionManager.updatePhase(sessionId, 'game-ended');
      const scores = sessionManager.getScores(sessionId);
      io.to(sessionId).emit('game:ended', scores);

      const existingInterval = timerIntervals.get(sessionId);
      if (existingInterval) {
        clearInterval(existingInterval);
        timerIntervals.delete(sessionId);
      }
    });

    socket.on('disconnect', () => {
      const sessionId = socket.data.sessionId;
      const teamId = socket.data.teamId;
      const role = socket.data.role;

      console.log('Client disconnected:', socket.id);

      if (sessionId && teamId && role === 'team') {
        sessionManager.updateTeam(sessionId, teamId, { connected: false });
        io.to(sessionId).emit('team:updated',
          sessionManager.getSession(sessionId)?.teams.get(teamId)!
        );
      }

      if (role === 'big-screen' && sessionId) {
        console.log(`Big screen disconnected from session ${sessionId}`);
      }
    });
  });

  server.listen(PORT, () => {
    console.log(`> Ready on http://localhost:${PORT}`);
    console.log(`> Environment: ${dev ? 'development' : 'production'}`);
  });
});
