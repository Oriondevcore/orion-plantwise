import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// Simple settings stored in a JSON file
const SETTINGS_FILE = path.join(process.cwd(), 'db', 'settings.json');

async function getSettings(): Promise<Record<string, string>> {
  try {
    const data = await fs.readFile(SETTINGS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return {};
  }
}

async function saveSettings(settings: Record<string, string>): Promise<void> {
  await fs.writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2));
}

export async function GET() {
  const settings = await getSettings();
  // Mask sensitive values
  const masked = Object.fromEntries(
    Object.entries(settings).map(([key, value]) => [
      key,
      key.toLowerCase().includes('key') || key.toLowerCase().includes('token')
        ? value ? '••••••••' : ''
        : value,
    ])
  );
  return NextResponse.json({ settings: masked });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const currentSettings = await getSettings();

    // Only update provided keys, don't overwrite with masked values
    for (const [key, value] of Object.entries(body)) {
      if (value !== '••••••••' && value !== '') {
        currentSettings[key] = value as string;
      } else if (value === '') {
        delete currentSettings[key];
      }
    }

    await saveSettings(currentSettings);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}