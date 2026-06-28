import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const reminders = await db.careReminder.findMany({
      where: { plantId: id },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ reminders });
  } catch (error) {
    console.error('Error fetching reminders:', error);
    return NextResponse.json({ error: 'Failed to fetch reminders' }, { status: 500 });
  }
}

function calculateNextDue(frequency: string): Date {
  const now = new Date();
  const freqMap: Record<string, number> = {
    daily: 1,
    every_2_days: 2,
    every_3_days: 3,
    weekly: 7,
    biweekly: 14,
    monthly: 30,
  };
  const days = freqMap[frequency] || 7;
  now.setDate(now.getDate() + days);
  return now;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { type, frequency, notes } = body;

    if (!type || !frequency) {
      return NextResponse.json({ error: 'Type and frequency are required' }, { status: 400 });
    }

    const nextDue = calculateNextDue(frequency);

    const reminder = await db.careReminder.create({
      data: {
        plantId: id,
        type,
        frequency,
        nextDue,
        notes: notes || null,
      },
    });

    return NextResponse.json({ reminder }, { status: 201 });
  } catch (error) {
    console.error('Error creating reminder:', error);
    return NextResponse.json({ error: 'Failed to create reminder' }, { status: 500 });
  }
}