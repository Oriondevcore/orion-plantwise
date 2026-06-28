import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    if (!query) {
      return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
    }

    const zai = await ZAI.create();

    // Step 1: Web search for plant information
    const searchResults = await zai.functions.invoke('web_search', {
      query: `${query} plant care guide species identification`,
      num: 8,
    });

    let searchContext = '';
    if (Array.isArray(searchResults) && searchResults.length > 0) {
      searchContext = searchResults
        .slice(0, 6)
        .map(
          (r: { name: string; snippet: string; url: string }, i: number) =>
            `${i + 1}. ${r.name}\n${r.snippet}\nSource: ${r.url}`
        )
        .join('\n\n');
    }

    // Step 2: LLM to format comprehensive plant guide
    const llmPrompt = `You are a comprehensive plant encyclopedia and care guide. The user is searching for information about: "${query}"

Based on the following research results, create a detailed, beautifully formatted plant guide:

${searchContext}

Provide your response as a comprehensive markdown guide with these sections:
## 🌱 [Plant Name]
A brief 2-3 sentence introduction to the plant.

### 📋 Quick Facts
- **Scientific Name:** ...
- **Family:** ...
- **Origin:** ...
- **Care Level:** ...
- **Growth Rate:** ...

### ☀️ Light Requirements
Details about light needs...

### 💧 Watering Guide
Detailed watering instructions...

### 🌡️ Temperature & Humidity
Ideal conditions...

### 🪴 Soil & Fertilizer
Soil type and feeding schedule...

### ✂️ Pruning & Maintenance
When and how to prune...

### 🐛 Common Pests & Problems
List common issues and solutions...

### 💡 Pro Tips
Expert care tips...

If the search results don't have enough information for a specific section, use your botanical knowledge to fill in reasonable details. Make the guide feel warm, friendly, and encouraging for plant owners.`;

    const llmResponse = await zai.chat.completions.create({
      messages: [
        {
          role: 'assistant',
          content:
            'You are a friendly and knowledgeable plant care expert. Create comprehensive, beautifully formatted plant care guides in markdown.',
        },
        {
          role: 'user',
          content: llmPrompt,
        },
      ],
      thinking: { type: 'disabled' },
    });

    const result = llmResponse.choices[0]?.message?.content || 'No information found.';

    return NextResponse.json({ result, sources: searchResults?.slice(0, 5) || [] });
  } catch (error) {
    console.error('Guide search error:', error);
    return NextResponse.json(
      { error: 'Guide search failed: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}