import { v4 as uuidv4 } from 'uuid';
import { GameSession, Team, Round, TeamAnswer, SerializedGameSession } from '@/types/game';
import { generateSessionCode } from '@/lib/utils/session-code';

class SessionManager {
  private sessions: Map<string, GameSession> = new Map();
  private codes: Map<string, string> = new Map();
  private cleanupIntervals: Map<string, NodeJS.Timeout> = new Map();

  createSession(masterId: string, useBigScreen: boolean = false): GameSession {
    const code = this.generateUniqueCode();
    const session: GameSession = {
      id: uuidv4(),
      code,
      createdAt: Date.now(),
      createdBy: masterId,
      phase: 'setup',
      currentRoundIndex: -1,
      rounds: [],
      teams: new Map(),
      useBigScreen,
    };

    this.sessions.set(session.id, session);
    this.codes.set(code, session.id);

    const timeout = setTimeout(() => {
      this.deleteSession(session.id);
    }, 4 * 60 * 60 * 1000);

    this.cleanupIntervals.set(session.id, timeout);

    console.log(`Session created: ${session.id} (code: ${code})`);
    return session;
  }

  getSession(sessionId: string): GameSession | undefined {
    return this.sessions.get(sessionId);
  }

  getSessionByCode(code: string): GameSession | undefined {
    const sessionId = this.codes.get(code.toUpperCase());
    return sessionId ? this.sessions.get(sessionId) : undefined;
  }

  serializeSession(session: GameSession): SerializedGameSession {
    return {
      ...session,
      teams: Array.from(session.teams.values()),
    };
  }

  addTeam(sessionId: string, team: Team): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    session.teams.set(team.id, team);
    console.log(`Team ${team.name} joined session ${sessionId}`);
    return true;
  }

  removeTeam(sessionId: string, teamId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    const removed = session.teams.delete(teamId);
    if (removed) {
      console.log(`Team ${teamId} left session ${sessionId}`);
    }
    return removed;
  }

  updateTeam(sessionId: string, teamId: string, updates: Partial<Team>): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    const team = session.teams.get(teamId);
    if (!team) return false;

    session.teams.set(teamId, { ...team, ...updates });
    return true;
  }

  addRound(sessionId: string, round: Omit<Round, 'id'>): Round | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    const newRound: Round = {
      ...round,
      id: uuidv4(),
    };

    session.rounds.push(newRound);
    console.log(`Round ${newRound.roundNumber} added to session ${sessionId}`);
    return newRound;
  }

  updateRound(sessionId: string, roundId: string, updates: Partial<Round>): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    const roundIndex = session.rounds.findIndex((r: Round) => r.id === roundId);
    if (roundIndex === -1) return false;

    session.rounds[roundIndex] = { ...session.rounds[roundIndex], ...updates };
    return true;
  }

  deleteRound(sessionId: string, roundId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    const initialLength = session.rounds.length;
    session.rounds = session.rounds.filter((r: Round) => r.id !== roundId);

    session.rounds.forEach((round: Round, index: number) => {
      round.roundNumber = index + 1;
    });

    return session.rounds.length < initialLength;
  }

  startRound(sessionId: string, roundIndex: number): { round: Round; timerEndsAt: number } | null {
    const session = this.sessions.get(sessionId);
    if (!session || !session.rounds[roundIndex]) return null;

    const round = session.rounds[roundIndex];
    session.currentRoundIndex = roundIndex;
    session.phase = 'round-active';
    session.timerStartedAt = Date.now();
    session.timerEndsAt = Date.now() + round.timeLimit * 1000;

    console.log(`Round ${round.roundNumber} started in session ${sessionId}`);
    return { round, timerEndsAt: session.timerEndsAt };
  }

  endRound(sessionId: string): Record<string, number> | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    session.phase = 'round-ended';
    session.timerEndsAt = undefined;

    const scores: Record<string, number> = {};
    session.teams.forEach((team: { id: string | number; totalScore: number; }) => {
      scores[team.id] = team.totalScore;
    });

    console.log(`Round ended in session ${sessionId}`);
    return scores;
  }

  submitAnswer(sessionId: string, teamId: string, roundId: string, answer: string): TeamAnswer | null {
    const session = this.sessions.get(sessionId);
    if (!session || session.phase !== 'round-active') return null;

    const team = session.teams.get(teamId);
    if (!team) return null;

    if (session.timerEndsAt && Date.now() > session.timerEndsAt) {
      return null;
    }

    const existingAnswerIndex = team.answers.findIndex((a: TeamAnswer) => a.roundId === roundId);
    const teamAnswer: TeamAnswer = {
      teamId,
      roundId,
      answer,
      submittedAt: Date.now(),
    };

    if (existingAnswerIndex !== -1) {
      team.answers[existingAnswerIndex] = teamAnswer;
    } else {
      team.answers.push(teamAnswer);
    }

    console.log(`Team ${team.name} submitted answer for round ${roundId}`);
    return teamAnswer;
  }

  awardPoints(sessionId: string, teamId: string, roundId: string, points: number): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    const team = session.teams.get(teamId);
    if (!team) return false;

    const answerIndex = team.answers.findIndex((a: TeamAnswer) => a.roundId === roundId);
    if (answerIndex === -1) return false;

    // Subtract previously awarded points if any
    const previousPoints = team.answers[answerIndex].pointsAwarded || 0;
    team.totalScore -= previousPoints;

    // Award new points
    team.answers[answerIndex].pointsAwarded = points;
    team.answers[answerIndex].isCorrect = points > 0;
    team.totalScore += points;

    console.log(`Awarded ${points} points to team ${team.name} (previous: ${previousPoints})`);
    return true;
  }

  updatePhase(sessionId: string, phase: GameSession['phase']): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    session.phase = phase;
    console.log(`Session ${sessionId} phase updated to ${phase}`);
    return true;
  }

  updateMasterId(sessionId: string, newMasterId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    session.createdBy = newMasterId;
    console.log(`Session ${sessionId} master updated to ${newMasterId}`);
    return true;
  }

  getScores(sessionId: string): Record<string, number> {
    const session = this.sessions.get(sessionId);
    if (!session) return {};

    const scores: Record<string, number> = {};
    session.teams.forEach((team: { id: string | number; totalScore: number; }) => {
      scores[team.id] = team.totalScore;
    });
    return scores;
  }

  deleteSession(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    this.codes.delete(session.code);
    this.sessions.delete(sessionId);

    const timeout = this.cleanupIntervals.get(sessionId);
    if (timeout) {
      clearTimeout(timeout);
      this.cleanupIntervals.delete(sessionId);
    }

    console.log(`Session ${sessionId} deleted`);
    return true;
  }

  private generateUniqueCode(): string {
    let code: string;
    do {
      code = generateSessionCode();
    } while (this.codes.has(code));
    return code;
  }

  getSessionCount(): number {
    return this.sessions.size;
  }
}

export const sessionManager = new SessionManager();
