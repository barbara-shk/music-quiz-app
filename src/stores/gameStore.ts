import { create } from 'zustand';
import { GamePhase, Round, Team } from '@/types/game';

interface GameState {
  sessionId: string | null;
  sessionCode: string | null;
  role: 'master' | 'team' | null;

  phase: GamePhase;
  currentRound: Round | null;
  currentRoundIndex: number;
  rounds: Round[];
  teams: Team[];

  myTeamId: string | null;
  myAnswer: string | null;

  timeRemaining: number;
  timerActive: boolean;

  setSession: (id: string, code: string) => void;
  setRole: (role: 'master' | 'team') => void;
  updatePhase: (phase: GamePhase) => void;
  setCurrentRound: (round: Round | null, index: number) => void;
  setRounds: (rounds: Round[]) => void;
  addRound: (round: Round) => void;
  updateRound: (roundId: string, updates: Partial<Round>) => void;
  deleteRound: (roundId: string) => void;
  setTeams: (teams: Team[]) => void;
  addTeam: (team: Team) => void;
  removeTeam: (teamId: string) => void;
  updateTeam: (teamId: string, updates: Partial<Team>) => void;
  setMyTeamId: (id: string) => void;
  setMyAnswer: (answer: string | null) => void;
  updateTimer: (timeRemaining: number) => void;
  setTimerActive: (active: boolean) => void;
  updateScores: (scores: Record<string, number>) => void;
  resetGame: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  sessionId: null,
  sessionCode: null,
  role: null,

  phase: 'setup',
  currentRound: null,
  currentRoundIndex: -1,
  rounds: [],
  teams: [],

  myTeamId: null,
  myAnswer: null,

  timeRemaining: 0,
  timerActive: false,

  setSession: (id, code) => set({ sessionId: id, sessionCode: code }),

  setRole: (role) => set({ role }),

  updatePhase: (phase) => set({ phase }),

  setCurrentRound: (round, index) => set({ currentRound: round, currentRoundIndex: index }),

  setRounds: (rounds) => set({ rounds }),

  addRound: (round) =>
    set((state) => ({
      rounds: [...state.rounds, round],
    })),

  updateRound: (roundId, updates) =>
    set((state) => ({
      rounds: state.rounds.map((r) => (r.id === roundId ? { ...r, ...updates } : r)),
    })),

  deleteRound: (roundId) =>
    set((state) => ({
      rounds: state.rounds.filter((r) => r.id !== roundId),
    })),

  setTeams: (teams) => set({ teams }),

  addTeam: (team) =>
    set((state) => ({
      teams: [...state.teams, team],
    })),

  removeTeam: (teamId) =>
    set((state) => ({
      teams: state.teams.filter((t) => t.id !== teamId),
    })),

  updateTeam: (teamId, updates) =>
    set((state) => ({
      teams: state.teams.map((t) => (t.id === teamId ? { ...t, ...updates } : t)),
    })),

  setMyTeamId: (id) => set({ myTeamId: id }),

  setMyAnswer: (answer) => set({ myAnswer: answer }),

  updateTimer: (timeRemaining) => set({ timeRemaining }),

  setTimerActive: (active) => set({ timerActive: active }),

  updateScores: (scores) =>
    set((state) => ({
      teams: state.teams.map((team) => ({
        ...team,
        totalScore: scores[team.id] ?? team.totalScore,
      })),
    })),

  resetGame: () =>
    set({
      sessionId: null,
      sessionCode: null,
      role: null,
      phase: 'setup',
      currentRound: null,
      currentRoundIndex: -1,
      rounds: [],
      teams: [],
      myTeamId: null,
      myAnswer: null,
      timeRemaining: 0,
      timerActive: false,
    }),
}));
