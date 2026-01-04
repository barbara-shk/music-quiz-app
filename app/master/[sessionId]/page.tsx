'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSocket } from '@/hooks/useSocket';
import { useGameStore } from '@/stores/gameStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RoundBuilder } from '@/components/game-master/RoundBuilder';
import { GameController } from '@/components/game-master/GameController';
import { TeamAnswersView } from '@/components/game-master/TeamAnswersView';
import { Scoreboard } from '@/components/shared/Scoreboard';
import { Copy, Users, Tv, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

export default function MasterDashboard() {
  const params = useParams();
  const router = useRouter();
  const { connected } = useSocket();
  const { sessionId, sessionCode, phase, teams, useBigScreen, setRole } = useGameStore();

  useEffect(() => {
    setRole('master');
  }, [setRole]);

  useEffect(() => {
    if (!sessionId && connected) {
      router.push('/master');
    }
  }, [sessionId, connected, router]);

  const handleCopyCode = () => {
    if (sessionCode) {
      navigator.clipboard.writeText(sessionCode);
      toast.success('Code copied to clipboard!');
    }
  };

  const handleOpenBigScreen = () => {
    if (sessionId) {
      const bigScreenUrl = `${window.location.origin}/bigscreen/${sessionId}`;
      window.open(bigScreenUrl, '_blank');
      toast.success('Big screen opened in new tab!');
    }
  };

  const handleCopyBigScreenUrl = () => {
    if (sessionId) {
      const bigScreenUrl = `${window.location.origin}/bigscreen/${sessionId}`;
      navigator.clipboard.writeText(bigScreenUrl);
      toast.success('Big screen URL copied to clipboard!');
    }
  };

  if (!sessionCode) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-500 to-indigo-600">
        <p className="text-white text-xl">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-indigo-600 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="text-3xl">Game Master Dashboard</CardTitle>
                <p className="text-muted-foreground mt-1">Control your music quiz game</p>
              </div>
              <div className="flex items-center gap-4">
                {useBigScreen && (
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">Big Screen Display</p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={handleOpenBigScreen}>
                        <Tv className="h-4 w-4 mr-2" />
                        Open Big Screen
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={handleCopyBigScreenUrl}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Join Code</p>
                  <div className="flex items-center gap-2">
                    <p className="text-4xl font-bold tracking-wider">{sessionCode}</p>
                    <Button variant="ghost" size="sm" onClick={handleCopyCode}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Teams Joined */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Teams Joined ({teams.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {teams.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">
                  Waiting for teams to join with code: <span className="font-bold text-lg">{sessionCode}</span>
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {teams.map((team) => (
                  <div key={team.id} className="p-3 border rounded-lg bg-muted/50">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold">{team.name}</p>
                      <Badge variant={team.connected ? 'default' : 'outline'}>
                        {team.connected ? 'Online' : 'Offline'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{team.members.join(', ')}</p>
                    <p className="text-xs text-muted-foreground mt-1">{team.totalScore} points</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Setup */}
          <div className="lg:col-span-2 space-y-6">
            {phase === 'setup' && <RoundBuilder />}
            {phase !== 'setup' && <TeamAnswersView />}
          </div>

          {/* Right Column - Control */}
          <div className="space-y-6">
            <GameController />
            {phase !== 'setup' && <Scoreboard />}
          </div>
        </div>
      </div>
    </div>
  );
}
