'use client';

import { useState, useEffect } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useGameStore } from '@/stores/gameStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export function AnswerInput() {
  const { emit } = useSocket();
  const { currentRound, phase, timerActive, myAnswer, setMyAnswer } = useGameStore();
  const [answer, setAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (phase === 'round-active') {
      setSubmitted(false);
      setAnswer('');
      setMyAnswer(null);
    }
  }, [phase, setMyAnswer]);

  const handleSubmit = () => {
    if (!currentRound || !answer.trim()) {
      toast.error('Please enter an answer');
      return;
    }

    emit('answer:submit', currentRound.id, answer);
    setMyAnswer(answer);
    setSubmitted(true);
    toast.success('Answer submitted!');
  };

  if (!currentRound) return null;

  if (phase !== 'round-active') {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">
            {phase === 'waiting' && 'Waiting for the game to start...'}
            {phase === 'round-ended' && 'Round ended! Waiting for next round...'}
            {phase === 'game-ended' && 'Game has ended!'}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (submitted || myAnswer) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="py-8">
          <div className="text-center">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
            <p className="text-lg font-semibold text-green-700 mb-2">Answer Submitted!</p>
            <p className="text-sm text-green-600">Your answer: {myAnswer || answer}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Answer</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentRound.answerFormat === 'free-text' ? (
          <div className="space-y-2">
            <Label htmlFor="answer">Type your answer</Label>
            <Input
              id="answer"
              placeholder="Enter your answer here..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && answer.trim()) {
                  handleSubmit();
                }
              }}
              disabled={!timerActive}
            />
          </div>
        ) : (
          <div className="space-y-3">
            <Label>Select your answer</Label>
            <RadioGroup value={answer} onValueChange={setAnswer} disabled={!timerActive}>
              {currentRound.multipleChoiceOptions?.map((option) => (
                <div key={option.id} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value={option.text} id={option.id} />
                  <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                    {option.text}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        )}

        <Button
          onClick={handleSubmit}
          disabled={!answer.trim() || !timerActive}
          className="w-full"
          size="lg"
        >
          <Send className="mr-2 h-4 w-4" />
          Submit Answer
        </Button>

        {!timerActive && (
          <p className="text-center text-sm text-red-600 font-medium">
            Time's up! You can no longer submit answers.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
