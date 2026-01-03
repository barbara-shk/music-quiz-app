'use client';

import { useGameStore } from '@/stores/gameStore';

export function useTimer() {
  const { timeRemaining, timerActive } = useGameStore();

  const getTimeDisplay = () => {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = (totalTime: number) => {
    return (timeRemaining / totalTime) * 100;
  };

  const getColorClass = () => {
    if (timeRemaining > 10) return 'text-green-600';
    if (timeRemaining > 5) return 'text-yellow-600';
    return 'text-red-600';
  };

  return {
    timeRemaining,
    timerActive,
    getTimeDisplay,
    getProgressPercentage,
    getColorClass,
  };
}
