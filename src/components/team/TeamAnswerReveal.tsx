'use client';

import { useEffect } from 'react';
import { useGameStore } from '@/stores/gameStore';
import confetti from 'canvas-confetti';
import { Trophy } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function TeamAnswerReveal() {
  const { answerRevealed, revealedAnswer } = useGameStore();

  useEffect(() => {
    if (answerRevealed) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      const audio = new Audio('/sounds/reveal.mp3');
      audio.play().catch(() => console.log('Could not play sound'));
    }
  }, [answerRevealed]);

  if (!answerRevealed) return null;

  return (
    <Card className="border-4 border-yellow-400 bg-gradient-to-r from-purple-50 to-pink-50 animate-in fade-in zoom-in duration-700">
      <CardContent className="py-12">
        <div className="text-center">
          <Trophy className="h-20 w-20 mx-auto text-yellow-500 mb-4 animate-bounce" />
          <h3 className="text-2xl font-bold mb-4">Correct Answer Revealed!</h3>
          <div className="bg-white rounded-lg p-6 shadow-lg inline-block">
            <p className="text-4xl font-bold text-purple-600">{revealedAnswer}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
