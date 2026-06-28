import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

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

    // Convert image to base64
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString('base64');
    const mimeType = imageFile.type || 'image/jpeg';
    const imageUrl = `data:${mimeType};base64,${base64Image}`;

    const zai = await ZAI.create();

    // Step 1: VLM Analysis
    const vlmPrompt = `You are an expert plant pathologist and botanist. Analyze this plant image in detail.

Identify:
1. The plant species (common name and scientific name if possible)
2. Any visible health issues: overwatering, underwatering, root rot, pests, nutrient deficiency, fungal/bacterial disease, etc.
3. The severity of each issue (mild, moderate, severe)
4. Overall health assessment

Also describe:
- Leaf color, texture, and any visible patterns
- Any spots, discoloration, wilting, or pest damage
- Soil condition if visible
- Growth pattern and overall plant vigor

Respond ONLY in valid JSON format:
{
  "species": "Common Name (Scientific name)",
  "speciesConfidence": 0.85,
  "issues": [
    {
      "name": "issue name",
      "severity": "mild|moderate|severe",
      "description": "detailed description",
      "causes": "possible causes"
    }
  ],
  "overallHealth": "healthy|warning|critical",
  "overallConfidence": 0.85,
  "description": "detailed plain-language description of the plant's condition",
  "leafDetails": "details about leaf condition",
  "environmentalFactors": "any environmental observations"
}`;

    const vlmResponse = await zai.chat.completions.createVision({
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: vlmPrompt },
            { type: 'image_url', image_url: { url: imageUrl } },
          ],
        },
      ],
      thinking: { type: 'disabled' },
    });

    const vlmContent = vlmResponse.choices[0]?.message?.content || '';
    let vlmResult;
    try {
      const jsonMatch = vlmContent.match(/\{[\s\S]*\}/);
      vlmResult = JSON.parse(jsonMatch ? jsonMatch[0] : vlmContent);
    } catch {
      vlmResult = {
        species: 'Unknown Plant',
        speciesConfidence: 0.3,
        issues: [],
        overallHealth: 'unknown',
        overallConfidence: 0.3,
        description: vlmContent,
        leafDetails: '',
        environmentalFactors: '',
      };
    }

    // Step 2: Web Search for RAG (if issues found)
    let ragContext = '';
    if (vlmResult.issues && vlmResult.issues.length > 0) {
      const speciesName = vlmResult.species || 'plant';
      const issueNames = vlmResult.issues.map((i: { name: string }) => i.name).join(', ');
      const searchQuery = `${speciesName} ${issueNames} treatment plant pathology diagnosis`;

      try {
        const searchResults = await zai.functions.invoke('web_search', {
          query: searchQuery,
          num: 5,
        });

        if (Array.isArray(searchResults) && searchResults.length > 0) {
          ragContext = searchResults
            .slice(0, 5)
            .map(
              (r: { name: string; snippet: string; url: string }, i: number) =>
                `${i + 1}. ${r.name}\n${r.snippet}\nSource: ${r.url}`
            )
            .join('\n\n');
        }
      } catch (searchError) {
        console.error('Web search failed, continuing without RAG:', searchError);
      }
    }

    // Step 3: LLM Enrichment
    const enrichmentPrompt = `You are an expert plant pathologist. Based on the AI visual analysis and external research, provide a comprehensive diagnosis.

## Visual Analysis Result:
${JSON.stringify(vlmResult, null, 2)}

${ragContext ? `## External Research Context:\n${ragContext}` : ''}

Please provide a comprehensive response in JSON format:
{
  "description": "A detailed, plain-language description of what's happening with the plant. Write as if explaining to a beginner plant owner. Include specific observations about leaves, stems, soil, and overall appearance. (2-3 paragraphs)",

  "fixes": "Step-by-step treatment recommendations in markdown format. For each issue found, provide:\n### Issue Name\n**Severity:** mild/moderate/severe\n**What's happening:** explanation\n**Step-by-step fix:**\n1. First step\n2. Second step\n3. etc.\n\n**Prevention tips:** bullet points\n",

  "speciesInfo": "Detailed information about the identified plant species in markdown format:\n## [Species Name]\n**Scientific name:** ...\n**Family:** ...\n**Care Level:** Easy/Moderate/Difficult\n**Light Requirements:** ...\n**Water Needs:** ...\n**Ideal Temperature:** ...\n**Common Problems:** ...\n**Fun Facts:** ...",

  "ragSources": ${JSON.stringify(ragContext ? 'Used external plant pathology databases for enhanced diagnosis accuracy.' : 'Diagnosis based on visual analysis only.')}
}`;

    const llmResponse = await zai.chat.completions.create({
      messages: [
        {
          role: 'assistant',
          content:
            'You are an expert plant pathologist and horticulturist. Provide accurate, helpful, and beginner-friendly plant care advice in JSON format.',
        },
        {
          role: 'user',
          content: enrichmentPrompt,
        },
      ],
      thinking: { type: 'disabled' },
    });

    const llmContent = llmResponse.choices[0]?.message?.content || '';
    let enrichmentResult;
    try {
      const jsonMatch = llmContent.match(/\{[\s\S]*\}/);
      enrichmentResult = JSON.parse(jsonMatch ? jsonMatch[0] : llmContent);
    } catch {
      enrichmentResult = {
        description: llmContent,
        fixes: 'Refer to the diagnosis description for recommendations.',
        speciesInfo: `## ${vlmResult.species || 'Unknown Plant'}\n${vlmResult.description || ''}`,
        ragSources: '',
      };
    }

    // Save to database
    const issues = vlmResult.issues || [];
    const confidence = vlmResult.overallConfidence || 0;

    const diagnosis = await db.diagnosis.create({
      data: {
        plantId: plantId || '',
        imageUrl: '/api/placeholder', // We don't persist the full base64
        species: vlmResult.species || null,
        issues: JSON.stringify(issues),
        confidence,
        description: enrichmentResult.description || vlmResult.description || '',
        fixes: enrichmentResult.fixes || '',
        speciesInfo: enrichmentResult.speciesInfo || '',
        ragContext: enrichmentResult.ragSources || ragContext || null,
      },
    });

    // If plantId provided, update plant health status and auto-create reminders
    if (plantId) {
      await db.plant.update({
        where: { id: plantId },
        data: {
          healthStatus: vlmResult.overallHealth || 'unknown',
          species: vlmResult.species || undefined,
        },
      });

      // Auto-create watering reminder if there are water-related issues
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