import { getSong } from 'genius-lyrics-api';

const GENIUS_API_KEY = process.env.GENIUS_API_KEY || '';

export async function fetchLyrics(artist: string, title: string): Promise<string | null> {
  if (!GENIUS_API_KEY) {
    console.warn('GENIUS_API_KEY not set');
    return null;
  }

  try {
    const result = await getSong({
      apiKey: GENIUS_API_KEY,
      title,
      artist,
      optimizeQuery: true,
    });
    return result?.lyrics || null;
  } catch (error) {
    console.error('Error fetching lyrics:', error);
    return null;
  }
}
