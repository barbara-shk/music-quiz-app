'use client';

import { useEffect, useState } from 'react';
import { useGameStore } from '@/stores/gameStore';
import confetti from 'canvas-confetti';
import { Trophy, Check } from 'lucide-react';

export function AnswerReveal() {
  const { revealedAnswer, resetReveal } = useGameStore();
  const [show, setShow] = useState(true);

  useEffect(() => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) {
        clearInterval(interval);
        return;
      }

      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#9333ea', '#ec4899', '#f59e0b'],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#9333ea', '#ec4899', '#f59e0b'],
      });
    }, 50);

    const audio = new Audio('/sounds/reveal.mp3');
    audio.play().catch(() => console.log('Could not play sound'));

    const timeout = setTimeout(() => {
      setShow(false);
      setTimeout(() => resetReveal(), 500);
    }, 10000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [resetReveal]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm transition-opacity duration-500 ${
        show ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="text-center max-w-4xl px-8 animate-in fade-in zoom-in duration-700">
        <div className="mb-8">
          <Trophy className="h-32 w-32 mx-auto text-yellow-400 animate-bounce" />
        </div>
        <h2 className="text-6xl font-bold mb-8 bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400 bg-clip-text text-transparent">
          Correct Answer!
        </h2>
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-12 shadow-2xl">
          <div className="flex items-center justify-center gap-4 mb-4">
            <Check className="h-12 w-12 text-white" />
            <p className="text-2xl font-semibold text-white/80">The answer is:</p>
          </div>
          <p className="text-7xl font-bold text-white">{revealedAnswer}</p>
        </div>
      </div>
    </div>
  );
}
