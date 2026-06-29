const CF_ACCOUNT = process.env.CLOUDFLARE_ACCOUNT_ID || 'fdd89cf30de14e1ddcfa5fbbf27581c1';
const CF_TOKEN = process.env.CLOUDFLARE_API_TOKEN || '';
const CF_API = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT}/ai/run`;

async function cfRun(model: string, body: Record<string, unknown>) {
  const res = await fetch(`${CF_API}/${model}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${CF_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const data = await res.json() as any;
  if (!data.success) throw new Error(data.errors?.[0]?.message || 'CF AI error');
  return data.result;
}

export async function analyzePlantImage(base64Image: string, mimeType: string) {
  const prompt = `You are an expert plant pathologist and botanist. Analyze this plant image in detail.

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

  const result = await cfRun('@cf/meta/llama-3.2-11b-vision-instruct', {
    messages: [{
      role: 'user',
      content: [
        { type: 'text', text: prompt },
        { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64Image}` } },
      ],
    }],
    max_tokens: 2048,
  });

  const content = result.response || '';
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    return JSON.parse(jsonMatch ? jsonMatch[0] : content);
  } catch {
    return {
      species: 'Unknown Plant',
      speciesConfidence: 0.3,
      issues: [],
      overallHealth: 'unknown',
      overallConfidence: 0.3,
      description: content,
      leafDetails: '',
      environmentalFactors: '',
    };
  }
}

export async function enrichDiagnosis(vlmResult: any) {
  const prompt = `You are an expert plant pathologist. Based on the AI visual analysis, provide a comprehensive diagnosis.

## Visual Analysis Result:
${JSON.stringify(vlmResult, null, 2)}

Please provide a comprehensive response in JSON format:
{
  "description": "A detailed, plain-language description of what's happening with the plant. Write as if explaining to a beginner plant owner. Include specific observations about leaves, stems, soil, and overall appearance. (2-3 paragraphs)",
  "fixes": "Step-by-step treatment recommendations in markdown format. For each issue found, provide:\n### Issue Name\n**Severity:** mild/moderate/severe\n**What's happening:** explanation\n**Step-by-step fix:**\n1. First step\n2. Second step\n3. etc.\n\n**Prevention tips:** bullet points\n",
  "speciesInfo": "Detailed information about the identified plant species in markdown format:\n## [Species Name]\n**Scientific name:** ...\n**Family:** ...\n**Care Level:** Easy/Moderate/Difficult\n**Light Requirements:** ...\n**Water Needs:** ...\n**Ideal Temperature:** ...\n**Common Problems:** ...\n**Fun Facts:** ..."
}`;

  const result = await cfRun('@cf/meta/llama-3.1-8b-instruct', {
    messages: [
      { role: 'system', content: 'You are an expert plant pathologist and horticulturist. Provide accurate, helpful, and beginner-friendly plant care advice in JSON format.' },
      { role: 'user', content: prompt },
    ],
    max_tokens: 4096,
  });

  const content = result.response || '';
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    return JSON.parse(jsonMatch ? jsonMatch[0] : content);
  } catch {
    return {
      description: content,
      fixes: 'Refer to the diagnosis description for recommendations.',
      speciesInfo: `## ${vlmResult.species || 'Unknown Plant'}\n${vlmResult.description || ''}`,
    };
  }
}

export async function searchPlantGuide(query: string) {
  const prompt = `You are a comprehensive plant encyclopedia and care guide. The user is searching for information about: "${query}"

Provide your response as a comprehensive markdown guide with these sections:
## [Plant Name]
A brief 2-3 sentence introduction to the plant.

### Quick Facts
- **Scientific Name:** ...
- **Family:** ...
- **Origin:** ...
- **Care Level:** ...
- **Growth Rate:** ...

### Light Requirements
Details about light needs...

### Watering Guide
Detailed watering instructions...

### Temperature & Humidity
Ideal conditions...

### Soil & Fertilizer
Soil type and feeding schedule...

### Pruning & Maintenance
When and how to prune...

### Common Pests & Problems
List common issues and solutions...

### Pro Tips
Expert care tips...

Use your botanical knowledge to provide accurate information. Make the guide feel warm, friendly, and encouraging for plant owners.`;

  const result = await cfRun('@cf/meta/llama-3.1-8b-instruct', {
    messages: [
      { role: 'system', content: 'You are a friendly and knowledgeable plant care expert. Create comprehensive, beautifully formatted plant care guides in markdown.' },
      { role: 'user', content: prompt },
    ],
    max_tokens: 4096,
  });

  return result.response || 'No information found.';
}
