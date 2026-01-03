'use client';

import { useEffect, useRef } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { getSpotifyTrackId, getSpotifyEmbedUrl } from '@/lib/media/spotify';

interface SpotifyPlayerProps {
  url: string;
}

export function SpotifyPlayer({ url }: SpotifyPlayerProps) {
  const trackId = getSpotifyTrackId(url);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { timerActive } = useGameStore();

  // Reload iframe when timer ends to stop playback
  useEffect(() => {
    if (!timerActive && iframeRef.current) {
      const src = iframeRef.current.src;
      iframeRef.current.src = '';
      setTimeout(() => {
        if (iframeRef.current) {
          iframeRef.current.src = src;
        }
      }, 100);
    }
  }, [timerActive]);

  if (!trackId) {
    return (
      <div className="flex items-center justify-center h-64 bg-muted rounded-lg">
        <p className="text-muted-foreground">Invalid Spotify URL</p>
      </div>
    );
  }

  const embedUrl = getSpotifyEmbedUrl(trackId);

  return (
    <div className="w-full rounded-lg overflow-hidden">
      <iframe
        ref={iframeRef}
        src={embedUrl}
        width="100%"
        height="352"
        frameBorder="0"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        className="rounded-lg"
      />
    </div>
  );
}
