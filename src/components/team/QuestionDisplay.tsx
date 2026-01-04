'use client';

import { Round } from '@/types/game';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { YouTubePlayer } from '@/components/media/YouTubePlayer';
import { SpotifyPlayer } from '@/components/media/SpotifyPlayer';
import { LyricsDisplay } from '@/components/media/LyricsDisplay';
import { useGameStore } from '@/stores/gameStore';
import { Music, Tv } from 'lucide-react';

interface QuestionDisplayProps {
  round: Round;
}

export function QuestionDisplay({ round }: QuestionDisplayProps) {
  const { useBigScreen } = useGameStore();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Music className="h-6 w-6" />
          Round {round.roundNumber}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
          <p className="text-2xl font-semibold text-center">{round.question}</p>
        </div>

        {useBigScreen ? (
          <div className="text-center text-sm text-muted-foreground p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Tv className="h-5 w-5" />
              <p className="font-semibold">Watch the big screen for media!</p>
            </div>
            <p className="text-xs">The question audio/video/lyrics are displayed on the main screen.</p>
          </div>
        ) : (
          <>
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
          </>
        )}
      </CardContent>
    </Card>
  );
}
