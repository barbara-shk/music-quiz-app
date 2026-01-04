'use client';

import { useEffect, useRef } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { getYouTubeVideoId, getYouTubeEmbedUrl } from '@/lib/media/youtube';

interface YouTubePlayerProps {
  url: string;
  audioOnly?: boolean;
  autoplay?: boolean;
  muted?: boolean;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export function YouTubePlayer({ url, audioOnly = false, autoplay = true, muted = false }: YouTubePlayerProps) {
  const videoId = getYouTubeVideoId(url);
  const playerRef = useRef<any>(null);
  const containerRef = useRef<string>(`youtube-player-${Math.random().toString(36).substr(2, 9)}`);
  const { timerActive } = useGameStore();

  // Load YouTube IFrame API
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }
  }, []);

  // Initialize player
  useEffect(() => {
    if (typeof window === 'undefined' || !videoId) return;

    const initPlayer = () => {
      if (window.YT && window.YT.Player) {
        playerRef.current = new window.YT.Player(containerRef.current, {
          videoId,
          playerVars: {
            autoplay: autoplay ? 1 : 0,
            controls: 0,
            modestbranding: 1,
            rel: 0,
            showinfo: 0,
            iv_load_policy: 3,
            disablekb: 1,
            mute: muted ? 1 : 0,
          },
          events: {
            onReady: (event: any) => {
              if (muted) {
                event.target.mute();
              }
              if (autoplay) {
                event.target.playVideo();
              }
            },
          },
        });
      } else {
        setTimeout(initPlayer, 100);
      }
    };

    initPlayer();

    return () => {
      if (playerRef.current && playerRef.current.destroy) {
        playerRef.current.destroy();
      }
    };
  }, [videoId, autoplay, muted]);

  // Stop playback when timer ends
  useEffect(() => {
    if (!timerActive && playerRef.current && playerRef.current.pauseVideo) {
      playerRef.current.pauseVideo();
    }
  }, [timerActive]);

  if (!videoId) {
    return (
      <div className="flex items-center justify-center h-64 bg-muted rounded-lg">
        <p className="text-muted-foreground">Invalid YouTube URL</p>
      </div>
    );
  }

  return (
    <div className="relative w-full rounded-lg overflow-hidden bg-black">
      {audioOnly ? (
        <div className="relative h-64 flex items-center justify-center bg-gradient-to-br from-purple-600 to-pink-600">
          <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
            <div className="text-center text-white">
              <div className="h-20 w-20 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center">
                <svg className="h-10 w-10" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
                </svg>
              </div>
              <p className="text-lg font-semibold">Listen carefully...</p>
            </div>
          </div>
          <div id={containerRef.current} className="absolute inset-0 w-full h-full" />
          {/* Overlay to hide YouTube title */}
          <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-purple-600/50 to-transparent pointer-events-none z-20" />
        </div>
      ) : (
        <div className="relative aspect-video">
          <div id={containerRef.current} className="w-full h-full" />
          {/* Overlay to hide YouTube title */}
          <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-black/80 to-transparent pointer-events-none z-10" />
        </div>
      )}
    </div>
  );
}
