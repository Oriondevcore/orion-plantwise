import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const plants = await db.plant.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        diagnoses: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        careReminders: {
          where: { enabled: true },
          orderBy: { nextDue: 'asc' },
          take: 1,
        },
        _count: {
          select: { diagnoses: true, careActivities: true },
        },
      },
    });

    return NextResponse.json({ plants });
  } catch (error) {
    console.error('Error fetching plants:', error);
    return NextResponse.json({ error: 'Failed to fetch plants' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, species, nickname, imageUrl, location, notes } = body;

    if (!name) {
      return NextResponse.json({ error: 'Plant name is required' }, { status: 400 });
    }

    const plant = await db.plant.create({
      data: {
        name,
        species: species || null,
        nickname: nickname || null,
        imageUrl: imageUrl || null,
        location: location || null,
        notes: notes || null,
      },
    });

    return NextResponse.json({ plant }, { status: 201 });
  } catch (error) {
    console.error('Error creating plant:', error);
    return NextResponse.json({ error: 'Failed to create plant' }, { status: 500 });
  }
}