'use client';

import { useGameStore } from '@/stores/gameStore';
import { BigScreenMedia } from './BigScreenMedia';
import { BigScreenLeaderboard } from './BigScreenLeaderboard';
import { BigScreenTimer } from './BigScreenTimer';
import { AnswerReveal } from './AnswerReveal';
import { Monitor } from 'lucide-react';

export function BigScreenDisplay() {
  const { phase, currentRound, answerRevealed } = useGameStore();

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <BigScreenTimer />

      {answerRevealed && <AnswerReveal />}

      {(phase === 'setup' || phase === 'waiting') && (
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <Monitor className="h-32 w-32 mx-auto mb-8 text-purple-400" />
            <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Music Quiz
            </h1>
            <p className="text-2xl text-gray-400">
              {phase === 'setup' ? 'Game starting soon...' : 'Get ready!'}
            </p>
          </div>
        </div>
      )}

      {phase === 'round-active' && currentRound && (
        <div className="h-screen flex flex-col p-8">
          <div className="flex-1 mb-8">
            <BigScreenMedia round={currentRound} />
          </div>

          <div className="h-2/5">
            <BigScreenLeaderboard />
          </div>
        </div>
      )}

      {phase === 'round-ended' && (
        <div className="h-screen flex flex-col p-8">
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-5xl font-bold mb-4">Round Complete!</h2>
              <p className="text-2xl text-gray-400">Reviewing answers...</p>
            </div>
          </div>
          <div className="h-2/5">
            <BigScreenLeaderboard />
          </div>
        </div>
      )}

      {phase === 'game-ended' && (
        <div className="h-screen flex items-center justify-center">
          <div className="text-center max-w-4xl">
            <h2 className="text-7xl font-bold mb-8 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
              Game Over!
            </h2>
            <BigScreenLeaderboard />
          </div>
        </div>
      )}
    </div>
  );
}
