'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSocket } from '@/hooks/useSocket';
import { useGameStore } from '@/stores/gameStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function MasterPage() {
  const router = useRouter();
  const { connected, emit } = useSocket();
  const { sessionId, sessionCode, setRole, resetGame } = useGameStore();

  useEffect(() => {
    setRole('master');
    // Clear any previous game state when creating a new game
    resetGame();
  }, [setRole, resetGame]);

  useEffect(() => {
    if (sessionId && sessionCode) {
      router.push(`/master/${sessionId}`);
    }
  }, [sessionId, sessionCode, router]);

  const handleCreateSession = () => {
    emit('session:create', 'Game Master');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-500 to-indigo-600 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-3xl font-bold">Game Master</CardTitle>
          <CardDescription className="text-base">
            Create a new game session for your music quiz
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!connected ? (
            <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Connecting to server...</span>
            </div>
          ) : (
            <Button
              size="lg"
              className="w-full bg-purple-600 hover:bg-purple-700"
              onClick={handleCreateSession}
            >
              Create New Game
            </Button>
          )}

          <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
            <p className="mb-2 font-semibold">As a Game Master, you will:</p>
            <ul className="list-inside list-disc space-y-1">
              <li>Create and configure quiz rounds</li>
              <li>Control the game flow</li>
              <li>See team answers in real-time</li>
              <li>Award points to teams</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
