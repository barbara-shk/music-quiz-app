'use client';

import { useGameStore } from '@/stores/gameStore';
import { Clock } from 'lucide-react';

export function BigScreenTimer() {
  const { timerActive, timeRemaining } = useGameStore();

  if (!timerActive && timeRemaining === 0) return null;

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const timeDisplay = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  const isUrgent = timeRemaining <= 10;

  return (
    <div className="absolute top-8 right-8 z-50">
      <div className={`flex items-center gap-3 bg-black/80 backdrop-blur-sm rounded-2xl px-6 py-4 border-2 ${
        isUrgent ? 'border-red-500 animate-pulse' : 'border-white/30'
      }`}>
        <Clock className={`h-8 w-8 ${isUrgent ? 'text-red-500' : 'text-white'}`} />
        <div className={`text-5xl font-bold ${isUrgent ? 'text-red-500' : 'text-white'}`}>
          {timeDisplay}
        </div>
      </div>
    </div>
  );
}
