'use client';

import { useSocket } from '@/hooks/useSocket';
import { useGameStore } from '@/stores/gameStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Square, SkipForward, Trophy, Eye } from 'lucide-react';
import { toast } from 'sonner';

export function GameController() {
  const { emit } = useSocket();
  const { phase, rounds, currentRoundIndex, teams } = useGameStore();

  const currentRound = rounds[currentRoundIndex];
  const hasNextRound = currentRoundIndex < rounds.length - 1;

  const handleStartGame = () => {
    if (rounds.length === 0) {
      toast.error('Please add at least one round before starting');
      return;
    }
    if (teams.length === 0) {
      toast.error('Waiting for teams to join...');
      return;
    }
    emit('game:start');
    toast.success('Game started! Teams can now see the waiting room.');
  };

  const handleStartRound = () => {
    const roundIndex = phase === 'waiting' ? 0 : currentRoundIndex + 1;
    emit('round:start', roundIndex);
    toast.success(`Round ${roundIndex + 1} started!`);
  };

  const handleEndRound = () => {
    emit('round:end');
    toast.success('Round ended');
  };

  const handleEndGame = () => {
    emit('game:end');
    toast.success('Game ended!');
  };

  const handleRevealAnswer = () => {
    if (!currentRound) {
      toast.error('No active round');
      return;
    }
    emit('answer:reveal', currentRound.id);
    toast.success('Answer revealed to all players!');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Game Control</span>
          <Badge variant={phase === 'round-active' ? 'default' : 'secondary'}>
            {phase === 'setup' && 'Setup'}
            {phase === 'waiting' && 'Waiting'}
            {phase === 'round-active' && 'Round Active'}
            {phase === 'round-ended' && 'Round Ended'}
            {phase === 'game-ended' && 'Game Ended'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentRound && (
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">Current Round</p>
            <p className="font-semibold text-lg">Round {currentRound.roundNumber}: {currentRound.question}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {currentRound.media.type} • {currentRound.answerFormat} • {currentRound.timeLimit}s
            </p>
          </div>
        )}

        <div className="space-y-2">
          {phase === 'setup' && (
            <Button
              onClick={handleStartGame}
              className="w-full"
              size="lg"
              disabled={rounds.length === 0}
            >
              <Play className="mr-2 h-4 w-4" />
              Start Game
            </Button>
          )}

          {(phase === 'waiting' || phase === 'round-ended') && (
            <Button
              onClick={handleStartRound}
              className="w-full"
              size="lg"
              disabled={!hasNextRound && phase === 'round-ended'}
            >
              <Play className="mr-2 h-4 w-4" />
              {phase === 'waiting' ? 'Start First Round' : 'Start Next Round'}
            </Button>
          )}

          {phase === 'round-active' && (
            <>
              <Button
                onClick={handleRevealAnswer}
                variant="secondary"
                className="w-full"
                size="lg"
              >
                <Eye className="mr-2 h-4 w-4" />
                Show Answer
              </Button>
              <Button
                onClick={handleEndRound}
                variant="destructive"
                className="w-full"
                size="lg"
              >
                <Square className="mr-2 h-4 w-4" />
                End Round
              </Button>
            </>
          )}

          {phase === 'round-ended' && (
            <Button
              onClick={handleRevealAnswer}
              variant="secondary"
              className="w-full"
              size="lg"
            >
              <Eye className="mr-2 h-4 w-4" />
              Show Answer
            </Button>
          )}

          {phase === 'round-ended' && !hasNextRound && (
            <Button
              onClick={handleEndGame}
              variant="outline"
              className="w-full"
              size="lg"
            >
              <Trophy className="mr-2 h-4 w-4" />
              End Game
            </Button>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2 pt-4 border-t">
          <div className="text-center">
            <p className="text-2xl font-bold">{rounds.length}</p>
            <p className="text-xs text-muted-foreground">Rounds</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{teams.length}</p>
            <p className="text-xs text-muted-foreground">Teams</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{currentRoundIndex + 1}</p>
            <p className="text-xs text-muted-foreground">Current</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
