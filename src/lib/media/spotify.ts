export function getSpotifyTrackId(url: string): string | null {
  const pattern = /(?:open\.spotify\.com\/track\/)([a-zA-Z0-9]+)/;
  const match = url.match(pattern);
  return match ? match[1] : null;
}

export function getSpotifyEmbedUrl(trackId: string): string {
  return `https://open.spotify.com/embed/track/${trackId}`;
}
