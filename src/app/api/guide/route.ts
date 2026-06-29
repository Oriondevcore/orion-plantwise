import { NextRequest, NextResponse } from 'next/server';
import { searchPlantGuide } from '@/lib/ai';

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    if (!query) {
      return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
    }

    const result = await searchPlantGuide(query);

    return NextResponse.json({ result, sources: [] });
  } catch (error) {
    console.error('Guide search error:', error);
    return NextResponse.json(
      { error: 'Guide search failed: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}
