'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSocket } from '@/hooks/useSocket';
import { useGameStore } from '@/stores/gameStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Users } from 'lucide-react';
import { toast } from 'sonner';

export default function TeamJoinPage() {
  const router = useRouter();
  const { connected, emit } = useSocket();
  const { sessionId, myTeamId, setRole, resetGame } = useGameStore();

  const [code, setCode] = useState('');
  const [teamName, setTeamName] = useState('');
  const [members, setMembers] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    setRole('team');
    // Clear any previous session when visiting the join page
    // This prevents auto-redirect from master sessions
    if (!myTeamId) {
      resetGame();
      // Clear localStorage master session
      if (typeof window !== 'undefined') {
        localStorage.removeItem('musicQuiz_session');
      }
    }
  }, [setRole, myTeamId, resetGame]);

  useEffect(() => {
    // Only redirect if we have BOTH sessionId and myTeamId (actual team member)
    if (sessionId && myTeamId) {
      router.push(`/team/${sessionId}`);
    }
  }, [sessionId, myTeamId, router]);

  const handleJoin = () => {
    if (!code.trim()) {
      toast.error('Please enter a session code');
      return;
    }
    if (!teamName.trim()) {
      toast.error('Please enter a team name');
      return;
    }
    if (!members.trim()) {
      toast.error('Please enter at least one team member');
      return;
    }

    setIsJoining(true);
    const membersList = members.split(',').map(m => m.trim()).filter(Boolean);

    emit('session:join', code.toUpperCase(), {
      name: teamName,
      members: membersList,
    });

    setTimeout(() => {
      setIsJoining(false);
    }, 2000);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-500 to-pink-500 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
            <Users className="h-8 w-8 text-orange-600" />
          </div>
          <CardTitle className="text-3xl font-bold">Join Game</CardTitle>
          <CardDescription className="text-base">
            Enter the code provided by the game master
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!connected ? (
            <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground py-8">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Connecting to server...</span>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="code">Session Code</Label>
                <Input
                  id="code"
                  placeholder="ABC123"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  maxLength={6}
                  className="text-center text-2xl font-bold tracking-wider"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="teamName">Team Name</Label>
                <Input
                  id="teamName"
                  placeholder="The Music Masters"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="members">Team Members (comma-separated)</Label>
                <Input
                  id="members"
                  placeholder="Alice, Bob, Charlie"
                  value={members}
                  onChange={(e) => setMembers(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Enter names separated by commas
                </p>
              </div>

              <Button
                size="lg"
                className="w-full bg-orange-600 hover:bg-orange-700"
                onClick={handleJoin}
                disabled={isJoining}
              >
                {isJoining ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Joining...
                  </>
                ) : (
                  'Join Game'
                )}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
