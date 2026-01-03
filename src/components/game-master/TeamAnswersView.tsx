'use client';

import { useEffect, useState } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useGameStore } from '@/stores/gameStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { TeamAnswer } from '@/types/game';
import { toast } from 'sonner';

export function TeamAnswersView() {
  const { emit } = useSocket();
  const { teams, currentRound, phase } = useGameStore();
  const [teamAnswers, setTeamAnswers] = useState<Map<string, TeamAnswer>>(new Map());

  useEffect(() => {
    if (!currentRound) {
      setTeamAnswers(new Map());
    }
  }, [currentRound]);

  useEffect(() => {
    const handleAnswerSubmitted = (teamId: string, answer: TeamAnswer) => {
      if (currentRound && answer.roundId === currentRound.id) {
        setTeamAnswers(prev => new Map(prev).set(teamId, answer));
      }
    };

    if (typeof window !== 'undefined') {
      const socket = (window as any).__socket;
      if (socket) {
        socket.on('answer:submitted', handleAnswerSubmitted);
        return () => {
          socket.off('answer:submitted', handleAnswerSubmitted);
        };
      }
    }
  }, [currentRound]);

  const handleAwardPoints = (teamId: string, points: number) => {
    if (!currentRound) return;
    emit('score:award', teamId, currentRound.id, points);
    toast.success(`Awarded ${points} points`);
  };

  if (!currentRound) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Team Answers</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">No active round</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Answers</CardTitle>
      </CardHeader>
      <CardContent>
        {phase === 'round-active' && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 text-blue-700">
              <Clock className="h-4 w-4 animate-pulse" />
              <span className="text-sm font-medium">Waiting for answers...</span>
            </div>
          </div>
        )}

        {phase === 'round-ended' && currentRound && (
          <div className="mb-4 p-3 bg-muted rounded-lg">
            <p className="text-sm font-medium">Correct Answer:</p>
            <p className="text-lg font-bold text-green-600">{currentRound.correctAnswer}</p>
          </div>
        )}

        <div className="space-y-3">
          {teams.map((team) => {
            const answer = teamAnswers.get(team.id);
            const teamRoundAnswer = team.answers.find(a => a.roundId === currentRound.id);

            return (
              <div key={team.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold">{team.name}</p>
                    <p className="text-xs text-muted-foreground">{team.members.join(', ')}</p>
                  </div>
                  {teamRoundAnswer?.isCorrect !== undefined && (
                    <Badge variant={teamRoundAnswer.isCorrect ? 'default' : 'destructive'}>
                      {teamRoundAnswer.isCorrect ? (
                        <CheckCircle className="h-3 w-3 mr-1" />
                      ) : (
                        <XCircle className="h-3 w-3 mr-1" />
                      )}
                      {teamRoundAnswer.pointsAwarded} pts
                    </Badge>
                  )}
                </div>

                {answer || teamRoundAnswer ? (
                  <>
                    <div className="mb-3 p-2 bg-muted rounded">
                      <p className="text-sm font-medium">
                        {answer?.answer || teamRoundAnswer?.answer || 'No answer'}
                      </p>
                    </div>

                    {phase === 'round-ended' && teamRoundAnswer?.isCorrect === undefined && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleAwardPoints(team.id, currentRound.points)}
                          className="flex-1"
                        >
                          Full Points ({currentRound.points})
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAwardPoints(team.id, Math.floor(currentRound.points / 2))}
                          className="flex-1"
                        >
                          Half ({Math.floor(currentRound.points / 2)})
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleAwardPoints(team.id, 0)}
                          className="flex-1"
                        >
                          None (0)
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No answer submitted</p>
                )}
              </div>
            );
          })}

          {teams.length === 0 && (
            <p className="text-center text-muted-foreground py-8">No teams joined yet</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
