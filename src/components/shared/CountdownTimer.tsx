'use client';

import { useTimer } from '@/hooks/useTimer';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface CountdownTimerProps {
  totalTime: number;
}

export function CountdownTimer({ totalTime }: CountdownTimerProps) {
  const { timeRemaining, timerActive, getTimeDisplay, getProgressPercentage, getColorClass } = useTimer();

  if (!timerActive && timeRemaining === 0) return null;

  const percentage = getProgressPercentage(totalTime);

  return (
    <div className="space-y-2">
      <div className={cn('text-center text-4xl font-bold transition-colors', getColorClass())}>
        {getTimeDisplay()}
      </div>
      <Progress value={percentage} className="h-3" />
      {timeRemaining <= 5 && timeRemaining > 0 && (
        <p className="text-center text-sm text-red-600 font-semibold animate-pulse">
          Time running out!
        </p>
      )}
    </div>
  );
}
