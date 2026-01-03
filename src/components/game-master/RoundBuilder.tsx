'use client';

import { useState } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useGameStore } from '@/stores/gameStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Plus, Trash2 } from 'lucide-react';
import { MediaType, AnswerFormat, MultipleChoiceOption } from '@/types/game';
import { toast } from 'sonner';

export function RoundBuilder() {
  const { emit } = useSocket();
  const { rounds } = useGameStore();

  const [question, setQuestion] = useState('');
  const [mediaType, setMediaType] = useState<MediaType>('youtube-audio');
  const [mediaUrl, setMediaUrl] = useState('');
  const [answerFormat, setAnswerFormat] = useState<AnswerFormat>('free-text');
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [timeLimit, setTimeLimit] = useState(30);
  const [points, setPoints] = useState(10);

  const [mcOptions, setMcOptions] = useState<MultipleChoiceOption[]>([
    { id: '1', text: '', isCorrect: false },
    { id: '2', text: '', isCorrect: false },
    { id: '3', text: '', isCorrect: false },
    { id: '4', text: '', isCorrect: false },
  ]);

  const handleAddRound = () => {
    if (!question.trim()) {
      toast.error('Please enter a question');
      return;
    }
    if (!mediaUrl.trim()) {
      toast.error('Please enter a media URL');
      return;
    }
    if (!correctAnswer.trim()) {
      toast.error('Please enter the correct answer');
      return;
    }

    if (answerFormat === 'multiple-choice') {
      const validOptions = mcOptions.filter(opt => opt.text.trim());
      if (validOptions.length < 2) {
        toast.error('Please provide at least 2 multiple choice options');
        return;
      }
      if (!validOptions.some(opt => opt.isCorrect)) {
        toast.error('Please mark at least one option as correct');
        return;
      }
    }

    const round = {
      roundNumber: rounds.length + 1,
      question,
      media: {
        type: mediaType,
        url: mediaUrl,
      },
      answerFormat,
      multipleChoiceOptions: answerFormat === 'multiple-choice'
        ? mcOptions.filter(opt => opt.text.trim())
        : undefined,
      correctAnswer,
      timeLimit,
      points,
    };

    emit('round:create', round);

    // Reset form
    setQuestion('');
    setMediaUrl('');
    setCorrectAnswer('');
    toast.success('Round added successfully!');
  };

  const handleDeleteRound = (roundId: string) => {
    emit('round:delete', roundId);
    toast.success('Round deleted');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New Round</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="question">Question</Label>
            <Input
              id="question"
              placeholder="What song is this?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="mediaType">Media Type</Label>
              <Select value={mediaType} onValueChange={(value) => setMediaType(value as MediaType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="youtube-audio">YouTube Audio</SelectItem>
                  <SelectItem value="youtube-video">YouTube Video (Muted)</SelectItem>
                  <SelectItem value="spotify">Spotify</SelectItem>
                  <SelectItem value="genius-lyrics">Lyrics</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="answerFormat">Answer Format</Label>
              <Select value={answerFormat} onValueChange={(value) => setAnswerFormat(value as AnswerFormat)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free-text">Free Text</SelectItem>
                  <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="mediaUrl">
              {mediaType === 'genius-lyrics' ? 'Artist and Song (e.g., "The Beatles - Hey Jude")' : 'Media URL'}
            </Label>
            <Input
              id="mediaUrl"
              placeholder={
                mediaType === 'youtube-audio' || mediaType === 'youtube-video'
                  ? 'https://www.youtube.com/watch?v=...'
                  : mediaType === 'spotify'
                  ? 'https://open.spotify.com/track/...'
                  : 'Artist - Song Title'
              }
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
            />
          </div>

          {answerFormat === 'multiple-choice' ? (
            <div className="space-y-3">
              <Label>Multiple Choice Options</Label>
              {mcOptions.map((option, index) => (
                <div key={option.id} className="flex items-center gap-2">
                  <RadioGroup
                    value={mcOptions.find(o => o.isCorrect)?.id}
                    onValueChange={(value) => {
                      setMcOptions(mcOptions.map(o => ({ ...o, isCorrect: o.id === value })));
                      setCorrectAnswer(mcOptions.find(o => o.id === value)?.text || '');
                    }}
                  >
                    <RadioGroupItem value={option.id} />
                  </RadioGroup>
                  <Input
                    placeholder={`Option ${index + 1}`}
                    value={option.text}
                    onChange={(e) => {
                      const newOptions = [...mcOptions];
                      newOptions[index].text = e.target.value;
                      setMcOptions(newOptions);
                      if (option.isCorrect) {
                        setCorrectAnswer(e.target.value);
                      }
                    }}
                  />
                </div>
              ))}
              <p className="text-xs text-muted-foreground">Select the correct answer</p>
            </div>
          ) : (
            <div>
              <Label htmlFor="correctAnswer">Correct Answer</Label>
              <Input
                id="correctAnswer"
                placeholder="The correct answer"
                value={correctAnswer}
                onChange={(e) => setCorrectAnswer(e.target.value)}
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="timeLimit">Time Limit (seconds)</Label>
              <Input
                id="timeLimit"
                type="number"
                min="10"
                max="120"
                value={timeLimit}
                onChange={(e) => setTimeLimit(Number(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="points">Points</Label>
              <Input
                id="points"
                type="number"
                min="1"
                max="100"
                value={points}
                onChange={(e) => setPoints(Number(e.target.value))}
              />
            </div>
          </div>

          <Button onClick={handleAddRound} className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Add Round
          </Button>
        </CardContent>
      </Card>

      {rounds.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Rounds ({rounds.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {rounds.map((round) => (
                <div
                  key={round.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-semibold">Round {round.roundNumber}: {round.question}</p>
                    <p className="text-sm text-muted-foreground">
                      {round.media.type} • {round.answerFormat} • {round.timeLimit}s • {round.points} pts
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteRound(round.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
