'use client';

import { Round } from '@/types/game';
import { YouTubePlayer } from '@/components/media/YouTubePlayer';
import { SpotifyPlayer } from '@/components/media/SpotifyPlayer';
import { LyricsDisplay } from '@/components/media/LyricsDisplay';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Music } from 'lucide-react';

interface QuestionDisplayProps {
  round: Round;
}

export function QuestionDisplay({ round }: QuestionDisplayProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Music className="h-6 w-6" />
          Round {round.roundNumber}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
          <p className="text-xl font-semibold text-center">{round.question}</p>
        </div>

        {/* Media Player */}
        {round.media.type === 'youtube-audio' && (
          <YouTubePlayer url={round.media.url} audioOnly={true} />
        )}
        {round.media.type === 'youtube-video' && (
          <YouTubePlayer url={round.media.url} audioOnly={false} />
        )}
        {round.media.type === 'spotify' && (
          <SpotifyPlayer url={round.media.url} />
        )}
        {round.media.type === 'genius-lyrics' && (
          <LyricsDisplay artistAndSong={round.media.url} />
        )}
      </CardContent>
    </Card>
  );
}
