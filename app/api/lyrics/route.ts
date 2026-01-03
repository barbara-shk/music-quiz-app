import { NextRequest, NextResponse } from 'next/server';
import { fetchLyrics } from '@/lib/media/genius';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const artist = searchParams.get('artist');
  const title = searchParams.get('title');

  if (!artist || !title) {
    return NextResponse.json(
      { error: 'Missing artist or title parameter' },
      { status: 400 }
    );
  }

  try {
    const lyrics = await fetchLyrics(artist, title);
    return NextResponse.json({ lyrics });
  } catch (error) {
    console.error('Error fetching lyrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lyrics' },
      { status: 500 }
    );
  }
}
