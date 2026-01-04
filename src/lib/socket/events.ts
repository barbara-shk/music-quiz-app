import { Round, Team, TeamAnswer, SerializedGameSession } from '@/types/game';

export interface ServerToClientEvents {
  'session:created': (data: { code: string; sessionId: string }) => void;
  'session:updated': (session: Partial<SerializedGameSession>) => void;

  'team:joined': (team: Team) => void;
  'team:left': (teamId: string) => void;
  'team:updated': (team: Team) => void;

  'round:started': (round: Round, timerEndsAt: number) => void;
  'round:ended': (scores: Record<string, number>) => void;
  'round:timer-sync': (timeRemaining: number) => void;

  'answer:submitted': (teamId: string, answer: TeamAnswer) => void;
  'answer:revealed': (roundId: string, correctAnswer: string) => void;

  'scores:updated': (scores: Record<string, number>) => void;

  'game:started': () => void;
  'game:ended': (finalScores: Record<string, number>) => void;

  error: (message: string) => void;
}

export interface ClientToServerEvents {
  'session:create': (masterName: string, useBigScreen: boolean) => void;
  'session:rejoin-master': (sessionId: string) => void;
  'session:join': (code: string, teamData: { name: string; members: string[] }) => void;
  'session:join-bigscreen': (sessionId: string) => void;
  'session:leave': () => void;

  'round:create': (round: Omit<Round, 'id'>) => void;
  'round:update': (roundId: string, updates: Partial<Round>) => void;
  'round:delete': (roundId: string) => void;
  'round:start': (roundIndex: number) => void;
  'round:end': () => void;

  'answer:submit': (roundId: string, answer: string) => void;
  'answer:reveal': (roundId: string) => void;

  'score:award': (teamId: string, roundId: string, points: number) => void;

  'game:start': () => void;
  'game:end': () => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  sessionId?: string;
  role?: 'master' | 'team' | 'big-screen';
  teamId?: string;
}
