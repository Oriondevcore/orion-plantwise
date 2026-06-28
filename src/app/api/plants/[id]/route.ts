import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const plant = await db.plant.findUnique({
      where: { id },
      include: {
        diagnoses: {
          orderBy: { createdAt: 'desc' },
        },
        careReminders: {
          orderBy: { createdAt: 'desc' },
        },
        careActivities: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!plant) {
      return NextResponse.json({ error: 'Plant not found' }, { status: 404 });
    }

    return NextResponse.json({ plant });
  } catch (error) {
    console.error('Error fetching plant:', error);
    return NextResponse.json({ error: 'Failed to fetch plant' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const plant = await db.plant.update({
      where: { id },
      data: body,
    });

    return NextResponse.json({ plant });
  } catch (error) {
    console.error('Error updating plant:', error);
    return NextResponse.json({ error: 'Failed to update plant' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.plant.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting plant:', error);
    return NextResponse.json({ error: 'Failed to delete plant' }, { status: 500 });
  }
}