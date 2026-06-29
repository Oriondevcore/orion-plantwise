import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { analyzePlantImage, enrichDiagnosis } from '@/lib/ai';

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

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image') as File | null;
    const plantId = formData.get('plantId') as string | null;

    if (!imageFile) {
      return NextResponse.json({ error: 'Image is required' }, { status: 400 });
    }

    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString('base64');
    const mimeType = imageFile.type || 'image/jpeg';

    const vlmResult = await analyzePlantImage(base64Image, mimeType);

    const enrichmentResult = await enrichDiagnosis(vlmResult);

    const issues = vlmResult.issues || [];
    const confidence = vlmResult.overallConfidence || 0;

    const diagnosis = await db.diagnosis.create({
      data: {
        plantId: plantId || '',
        imageUrl: '/api/placeholder',
        species: vlmResult.species || null,
        issues: JSON.stringify(issues),
        confidence,
        description: enrichmentResult.description || vlmResult.description || '',
        fixes: enrichmentResult.fixes || '',
        speciesInfo: enrichmentResult.speciesInfo || '',
        ragContext: null,
      },
    });

    if (plantId) {
      await db.plant.update({
        where: { id: plantId },
        data: {
          healthStatus: vlmResult.overallHealth || 'unknown',
          species: vlmResult.species || undefined,
        },
      });

      const hasWaterIssue = issues.some(
        (i: { name: string }) =>
          i.name.toLowerCase().includes('water') ||
          i.name.toLowerCase().includes('rot')
      );
      if (hasWaterIssue) {
        const existingWaterReminder = await db.careReminder.findFirst({
          where: { plantId, type: 'watering' },
        });
        if (!existingWaterReminder) {
          const nextDue = calculateNextDue('every_3_days');
          await db.careReminder.create({
            data: {
              plantId,
              type: 'watering',
              frequency: 'every_3_days',
              nextDue,
              notes: 'Auto-created based on diagnosis',
            },
          });
        }
      }
    }

    return NextResponse.json({
      diagnosis: {
        ...diagnosis,
        issues,
        vlmRaw: vlmResult,
        enrichment: enrichmentResult,
      },
    });
  } catch (error) {
    console.error('Diagnosis error:', error);
    return NextResponse.json(
      { error: 'Diagnosis failed: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}
