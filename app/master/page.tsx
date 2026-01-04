'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSocket } from '@/hooks/useSocket';
import { useGameStore } from '@/stores/gameStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Loader2, Tv, Users } from 'lucide-react';

export default function MasterPage() {
  const router = useRouter();
  const { connected, emit } = useSocket();
  const { sessionId, sessionCode, setRole, resetGame } = useGameStore();
  const [displayMode, setDisplayMode] = useState<'teams' | 'bigscreen'>('teams');

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
    const useBigScreen = displayMode === 'bigscreen';
    emit('session:create', 'Game Master', useBigScreen);
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
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label className="text-base font-semibold">Display Mode</Label>
            <RadioGroup value={displayMode} onValueChange={(value) => setDisplayMode(value as 'teams' | 'bigscreen')}>
              <div className="flex items-start space-x-3 rounded-lg border p-4 hover:bg-accent cursor-pointer">
                <RadioGroupItem value="teams" id="teams" />
                <div className="flex-1">
                  <Label htmlFor="teams" className="cursor-pointer font-medium flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Teams Have Media
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Traditional mode - teams see media on their own screens
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3 rounded-lg border p-4 hover:bg-accent cursor-pointer">
                <RadioGroupItem value="bigscreen" id="bigscreen" />
                <div className="flex-1">
                  <Label htmlFor="bigscreen" className="cursor-pointer font-medium flex items-center gap-2">
                    <Tv className="h-4 w-4" />
                    Big Screen Mode
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Media displays only on a separate big screen/TV
                  </p>
                </div>
              </div>
            </RadioGroup>
          </div>

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
