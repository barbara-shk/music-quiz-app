declare module 'genius-lyrics-api' {
  interface GetSongOptions {
    apiKey: string;
    title: string;
    artist: string;
    optimizeQuery?: boolean;
  }

  interface SongResult {
    id: number;
    title: string;
    fullTitle: string;
    featuredTitle: string;
    url: string;
    songArtImageUrl: string;
    releaseDate: string;
    lyrics: string;
  }

  export function getSong(options: GetSongOptions): Promise<SongResult | null>;
}
