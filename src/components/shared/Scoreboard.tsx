'use client';

import { useGameStore } from '@/stores/gameStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Users } from 'lucide-react';

export function Scoreboard() {
  const { teams, myTeamId } = useGameStore();

  const sortedTeams = [...teams].sort((a, b) => b.totalScore - a.totalScore);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Scoreboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sortedTeams.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No teams yet</p>
        ) : (
          <div className="space-y-2">
            {sortedTeams.map((team, index) => (
              <div
                key={team.id}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  team.id === myTeamId ? 'bg-purple-50 border-purple-300' : 'bg-muted/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold">{team.name}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Users className="h-3 w-3" />
                      <span>{team.members.length} member{team.members.length !== 1 ? 's' : ''}</span>
                      {!team.connected && (
                        <Badge variant="outline" className="ml-2 text-xs">Offline</Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-purple-600">{team.totalScore}</p>
                  <p className="text-xs text-muted-foreground">points</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
