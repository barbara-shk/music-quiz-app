'use client';

import { Round } from '@/types/game';
import { YouTubePlayer } from '@/components/media/YouTubePlayer';
import { SpotifyPlayer } from '@/components/media/SpotifyPlayer';
import { LyricsDisplay } from '@/components/media/LyricsDisplay';

interface BigScreenMediaProps {
  round: Round;
}

export function BigScreenMedia({ round }: BigScreenMediaProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-6">
          <h2 className="text-4xl font-bold text-center">Round {round.roundNumber}</h2>
          <p className="text-2xl text-center mt-4">{round.question}</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-6xl">
          {round.media.type === 'youtube-audio' && (
            <YouTubePlayer url={round.media.url} audioOnly={true} muted={true} />
          )}
          {round.media.type === 'youtube-video' && (
            <YouTubePlayer url={round.media.url} audioOnly={false} muted={true} />
          )}
          {round.media.type === 'spotify' && (
            <SpotifyPlayer url={round.media.url} />
          )}
          {round.media.type === 'genius-lyrics' && (
            <LyricsDisplay artistAndSong={round.media.url} />
          )}
        </div>
      </div>
    </div>
  );
}
