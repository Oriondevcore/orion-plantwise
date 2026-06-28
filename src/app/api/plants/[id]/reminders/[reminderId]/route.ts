import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

function calculateNextDue(frequency: string, fromDate?: Date): Date {
  const now = fromDate || new Date();
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; reminderId: string }> }
) {
  try {
    const { reminderId } = await params;
    const body = await request.json();
    const { enabled, frequency, notes, markDone } = body;

    const existing = await db.careReminder.findUnique({ where: { id: reminderId } });
    if (!existing) {
      return NextResponse.json({ error: 'Reminder not found' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (enabled !== undefined) updateData.enabled = enabled;
    if (frequency) updateData.frequency = frequency;
    if (notes !== undefined) updateData.notes = notes;

    if (markDone) {
      const now = new Date();
      updateData.lastDone = now;
      updateData.nextDue = calculateNextDue(existing.frequency, now);
    }

    const reminder = await db.careReminder.update({
      where: { id: reminderId },
      data: updateData,
    });

    return NextResponse.json({ reminder });
  } catch (error) {
    console.error('Error updating reminder:', error);
    return NextResponse.json({ error: 'Failed to update reminder' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; reminderId: string }> }
) {
  try {
    const { reminderId } = await params;
    await db.careReminder.delete({ where: { id: reminderId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting reminder:', error);
    return NextResponse.json({ error: 'Failed to delete reminder' }, { status: 500 });
  }
}