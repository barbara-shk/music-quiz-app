'use client';

import { useGameStore } from '@/stores/gameStore';
import { Trophy, Users } from 'lucide-react';

export function BigScreenLeaderboard() {
  const { teams } = useGameStore();
  const sortedTeams = [...teams].sort((a, b) => b.totalScore - a.totalScore);

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 h-full overflow-hidden">
      <div className="flex items-center gap-3 mb-6">
        <Trophy className="h-8 w-8 text-yellow-400" />
        <h3 className="text-3xl font-bold">Leaderboard</h3>
      </div>

      <div className="space-y-3 overflow-y-auto max-h-[calc(100%-4rem)]">
        {sortedTeams.map((team, index) => (
          <div
            key={team.id}
            className={`flex items-center justify-between p-4 rounded-xl ${
              index === 0
                ? 'bg-gradient-to-r from-yellow-500/30 to-orange-500/30 border-2 border-yellow-400'
                : 'bg-white/5'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`flex h-12 w-12 items-center justify-center rounded-full font-bold text-2xl ${
                index === 0 ? 'bg-yellow-400 text-black' :
                index === 1 ? 'bg-gray-300 text-black' :
                index === 2 ? 'bg-orange-400 text-black' :
                'bg-white/10 text-white'
              }`}>
                {index + 1}
              </div>
              <div>
                <p className="text-2xl font-semibold">{team.name}</p>
                <div className="flex items-center gap-1 text-sm text-gray-300">
                  <Users className="h-4 w-4" />
                  <span>{team.members.length} member{team.members.length !== 1 ? 's' : ''}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold text-purple-400">{team.totalScore}</p>
              <p className="text-sm text-gray-400">points</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
