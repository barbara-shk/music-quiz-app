'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface LyricsDisplayProps {
  artistAndSong: string;
}

export function LyricsDisplay({ artistAndSong }: LyricsDisplayProps) {
  const [lyrics, setLyrics] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLyrics = async () => {
      try {
        setLoading(true);
        const [artist, ...songParts] = artistAndSong.split('-').map(s => s.trim());
        const song = songParts.join('-');

        const response = await fetch(
          `/api/lyrics?artist=${encodeURIComponent(artist)}&title=${encodeURIComponent(song)}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch lyrics');
        }

        const data = await response.json();
        if (data.lyrics) {
          setLyrics(data.lyrics);
        } else {
          setError('Lyrics not found');
        }
      } catch (err) {
        setError('Failed to load lyrics');
      } finally {
        setLoading(false);
      }
    };

    fetchLyrics();
  }, [artistAndSong]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 bg-muted rounded-lg">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-muted-foreground" />
          <p className="text-muted-foreground">Loading lyrics...</p>
        </div>
      </div>
    );
  }

  if (error || !lyrics) {
    return (
      <div className="flex items-center justify-center h-96 bg-muted rounded-lg">
        <p className="text-muted-foreground">{error || 'No lyrics available'}</p>
      </div>
    );
  }

  return (
    <div className="max-h-96 overflow-y-auto bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6">
      <div className="prose prose-sm max-w-none">
        <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
          {lyrics}
        </pre>
      </div>
    </div>
  );
}
