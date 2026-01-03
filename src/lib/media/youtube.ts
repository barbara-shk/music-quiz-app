export function getYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([^&\s]+)/,
    /(?:youtu\.be\/)([^&\s]+)/,
    /(?:youtube\.com\/embed\/)([^&\s]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
}

export function getYouTubeEmbedUrl(videoId: string, autoplay: boolean = false): string {
  return `https://www.youtube.com/embed/${videoId}?${autoplay ? 'autoplay=1&' : ''}enablejsapi=1`;
}
