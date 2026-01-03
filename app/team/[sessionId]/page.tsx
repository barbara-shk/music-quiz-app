'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSocket } from '@/hooks/useSocket';
import { useGameStore } from '@/stores/gameStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { QuestionDisplay } from '@/components/team/QuestionDisplay';
import { AnswerInput } from '@/components/team/AnswerInput';
import { CountdownTimer } from '@/components/shared/CountdownTimer';
import { Scoreboard } from '@/components/shared/Scoreboard';
import { Users, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function TeamPlayPage() {
  const params = useParams();
  const router = useRouter();
  const { connected } = useSocket();
  const { sessionId, phase, currentRound, teams, myTeamId, setRole } = useGameStore();

  useEffect(() => {
    setRole('team');
  }, [setRole]);

  useEffect(() => {
    if (!sessionId && connected) {
      router.push('/team');
    }
  }, [sessionId, connected, router]);

  useEffect(() => {
    if (phase === 'game-ended') {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [phase]);

  const myTeam = teams.find(t => t.id === myTeamId);

  if (!myTeam) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-500 to-pink-500">
        <p className="text-white text-xl">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 to-pink-500 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="text-3xl flex items-center gap-2">
                  <Users className="h-8 w-8" />
                  {myTeam.name}
                </CardTitle>
                <p className="text-muted-foreground mt-1">{myTeam.members.join(', ')}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <Trophy className="h-8 w-8 mx-auto text-yellow-500 mb-1" />
                  <p className="text-3xl font-bold">{myTeam.totalScore}</p>
                  <p className="text-xs text-muted-foreground">points</p>
                </div>
                <Badge variant={
                  phase === 'waiting' ? 'secondary' :
                  phase === 'round-active' ? 'default' :
                  phase === 'round-ended' ? 'outline' :
                  phase === 'game-ended' ? 'secondary' : 'secondary'
                }>
                  {phase === 'waiting' && 'Get Ready!'}
                  {phase === 'round-active' && 'Playing'}
                  {phase === 'round-ended' && 'Round Over'}
                  {phase === 'game-ended' && 'Game Over'}
                  {phase === 'setup' && 'Waiting...'}
                </Badge>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Waiting State */}
        {(phase === 'setup' || phase === 'waiting') && (
          <Card>
            <CardContent className="py-16">
              <div className="text-center">
                <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-2xl font-bold mb-2">
                  {phase === 'setup' ? 'Waiting for game to start...' : 'Get Ready!'}
                </h2>
                <p className="text-muted-foreground">
                  {phase === 'setup'
                    ? 'The game master is setting up the rounds'
                    : 'The first round will begin shortly'}
                </p>
                <div className="mt-8">
                  <p className="text-sm text-muted-foreground mb-2">Teams in this game:</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {teams.map(team => (
                      <Badge key={team.id} variant={team.id === myTeamId ? 'default' : 'outline'}>
                        {team.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Game Active */}
        {phase === 'round-active' && currentRound && (
          <div className="space-y-6">
            <CountdownTimer totalTime={currentRound.timeLimit} />
            <QuestionDisplay round={currentRound} />
            <AnswerInput />
          </div>
        )}

        {/* Round Ended */}
        {phase === 'round-ended' && (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Trophy className="h-16 w-16 mx-auto text-yellow-500 mb-4" />
                <h2 className="text-2xl font-bold mb-2">Round Complete!</h2>
                <p className="text-muted-foreground">
                  The game master is reviewing answers...
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Game Ended */}
        {phase === 'game-ended' && (
          <Card className="border-4 border-yellow-400">
            <CardContent className="py-16">
              <div className="text-center">
                <Trophy className="h-24 w-24 mx-auto text-yellow-500 mb-4 animate-bounce" />
                <h2 className="text-4xl font-bold mb-4">Game Over!</h2>
                <p className="text-xl text-muted-foreground mb-8">
                  Thanks for playing!
                </p>
                <div className="max-w-md mx-auto">
                  <Scoreboard />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Scoreboard - Always visible during game */}
        {phase !== 'setup' && phase !== 'game-ended' && (
          <Scoreboard />
        )}
      </div>
    </div>
  );
}
