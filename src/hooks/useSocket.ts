'use client';

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useGameStore } from '@/stores/gameStore';
import type { ServerToClientEvents, ClientToServerEvents } from '@/lib/socket/events';

type ClientSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

// Global socket instance (singleton)
let globalSocket: ClientSocket | null = null;
let isInitialized = false;

export function useSocket() {
  const socketRef = useRef<ClientSocket | null>(null);
  const [connected, setConnected] = useState(false);

  const {
    setSession,
    addTeam,
    removeTeam,
    updateTeam,
    setCurrentRound,
    updatePhase,
    updateTimer,
    setTimerActive,
    updateScores,
    setRounds,
    setTeams,
    setMyTeamId,
  } = useGameStore();

  useEffect(() => {
    // Use global socket instance (singleton pattern)
    if (!globalSocket) {
      globalSocket = io({
        path: '/socket.io',
      });

      // Expose socket globally for components that need direct access
      if (typeof window !== 'undefined') {
        (window as any).__socket = globalSocket;
      }
    }

    const socket = globalSocket;
    socketRef.current = socket;

    // Set initial connected state
    setConnected(socket.connected);

    // Listen to connection state changes for this hook instance
    const handleConnect = () => {
      console.log('Connected to server');
      setConnected(true);
    };

    const handleDisconnect = () => {
      console.log('Disconnected from server');
      setConnected(false);
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    // Only initialize game event listeners once globally
    if (isInitialized) {
      return () => {
        socket.off('connect', handleConnect);
        socket.off('disconnect', handleDisconnect);
      };
    }
    isInitialized = true;

    // Game event listeners (only set up once)
    // Auto-rejoin on connect
    const handleAutoRejoin = () => {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('musicQuiz_session');
        if (stored) {
          try {
            const { sessionId, role } = JSON.parse(stored);
            if (role === 'master' && sessionId) {
              console.log('Rejoining as master:', sessionId);
              socket.emit('session:rejoin-master', sessionId);
            }
          } catch (e) {
            console.error('Failed to parse stored session:', e);
          }
        }
      }
    };

    socket.on('connect', handleAutoRejoin);

    socket.on('session:created', ({ code, sessionId }) => {
      setSession(sessionId, code);
      updatePhase('setup');
      // Store master session in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('musicQuiz_session', JSON.stringify({ sessionId, code, role: 'master' }));
      }
    });

    socket.on('session:updated', (session: any) => {
      if (session.id && session.code) {
        setSession(session.id, session.code);
      }
      if (session.rounds) {
        setRounds(session.rounds);
      }
      if (session.teams) {
        setTeams(session.teams);
      }
      if (session.phase) {
        updatePhase(session.phase);
      }
      if (session.myTeamId) {
        setMyTeamId(session.myTeamId);
      }
    });

    socket.on('team:joined', (team) => {
      addTeam(team);
    });

    socket.on('team:left', (teamId) => {
      removeTeam(teamId);
    });

    socket.on('team:updated', (team) => {
      updateTeam(team.id, team);
    });

    socket.on('round:started', (round, timerEndsAt) => {
      setCurrentRound(round, round.roundNumber - 1);
      updatePhase('round-active');
      setTimerActive(true);

      const timeRemaining = Math.max(0, Math.floor((timerEndsAt - Date.now()) / 1000));
      updateTimer(timeRemaining);
    });

    socket.on('round:timer-sync', (timeRemaining) => {
      updateTimer(timeRemaining);
      if (timeRemaining <= 0) {
        setTimerActive(false);
      }
    });

    socket.on('round:ended', (scores) => {
      updatePhase('round-ended');
      setTimerActive(false);
      updateScores(scores);
    });

    socket.on('scores:updated', (scores) => {
      updateScores(scores);
    });

    socket.on('game:started', () => {
      updatePhase('waiting');
    });

    socket.on('game:ended', (finalScores) => {
      updatePhase('game-ended');
      updateScores(finalScores);
      setTimerActive(false);
    });

    socket.on('error', (message) => {
      console.error('Socket error:', message);
    });

    // Cleanup: only remove the connect/disconnect listeners for this hook instance
    // Don't disconnect the global socket
    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
    };
  }, []);

  const emit = <K extends keyof ClientToServerEvents>(
    event: K,
    ...args: Parameters<ClientToServerEvents[K]>
  ) => {
    if (socketRef.current) {
      (socketRef.current.emit as any)(event, ...args);
    }
  };

  return { socket: socketRef.current, connected, emit };
}
