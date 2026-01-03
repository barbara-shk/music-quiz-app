export type MediaType = 'youtube-audio' | 'youtube-video' | 'spotify' | 'genius-lyrics';

export type AnswerFormat = 'free-text' | 'multiple-choice';

export type GamePhase = 'setup' | 'waiting' | 'round-active' | 'round-ended' | 'game-ended';

export interface MediaTrack {
  type: MediaType;
  url: string;
  title?: string;
  artist?: string;
  startTime?: number;
  endTime?: number;
}

export interface MultipleChoiceOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface Round {
  id: string;
  roundNumber: number;
  question: string;
  media: MediaTrack;
  answerFormat: AnswerFormat;
  multipleChoiceOptions?: MultipleChoiceOption[];
  correctAnswer: string;
  timeLimit: number;
  points: number;
}

export interface TeamAnswer {
  teamId: string;
  roundId: string;
  answer: string;
  submittedAt: number;
  isCorrect?: boolean;
  pointsAwarded?: number;
}

export interface Team {
  id: string;
  name: string;
  members: string[];
  totalScore: number;
  answers: TeamAnswer[];
  joinedAt: number;
  connected: boolean;
}

export interface GameSession {
  id: string;
  code: string;
  createdAt: number;
  createdBy: string;
  phase: GamePhase;
  currentRoundIndex: number;
  rounds: Round[];
  teams: Map<string, Team>;
  timerStartedAt?: number;
  timerEndsAt?: number;
}

export interface SerializedGameSession extends Omit<GameSession, 'teams'> {
  teams: Team[];
}
