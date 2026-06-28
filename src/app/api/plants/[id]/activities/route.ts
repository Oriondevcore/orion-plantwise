import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const activities = await db.careActivity.findMany({
      where: { plantId: id },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ activities });
  } catch (error) {
    console.error('Error fetching activities:', error);
    return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { type, notes } = body;

    if (!type) {
      return NextResponse.json({ error: 'Activity type is required' }, { status: 400 });
    }

    const activity = await db.careActivity.create({
      data: {
        plantId: id,
        type,
        notes: notes || null,
      },
    });

    // If watering or fertilizing, also update the related reminder's lastDone
    if (type === 'watering' || type === 'fertilizing') {
      const reminder = await db.careReminder.findFirst({
        where: { plantId: id, type, enabled: true },
      });
      if (reminder) {
        const freqMap: Record<string, number> = {
          daily: 1,
          every_2_days: 2,
          every_3_days: 3,
          weekly: 7,
          biweekly: 14,
          monthly: 30,
        };
        const nextDue = new Date();
        nextDue.setDate(nextDue.getDate() + (freqMap[reminder.frequency] || 7));
        await db.careReminder.update({
          where: { id: reminder.id },
          data: { lastDone: new Date(), nextDue },
        });
      }
    }

    return NextResponse.json({ activity }, { status: 201 });
  } catch (error) {
    console.error('Error creating activity:', error);
    return NextResponse.json({ error: 'Failed to create activity' }, { status: 500 });
  }
}