import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const ENV_FILE = path.join(process.cwd(), '.env.local');

export async function GET() {
  const apiKey = process.env.OPENAI_API_KEY || '';

  if (apiKey) {
    // Mask the key for security
    const masked = apiKey.length > 12
      ? `${apiKey.substring(0, 8)}${'*'.repeat(apiKey.length - 12)}${apiKey.substring(apiKey.length - 4)}`
      : '*'.repeat(apiKey.length);

    return NextResponse.json({
      configured: true,
      key: masked
    });
  }

  return NextResponse.json({
    configured: false,
    key: ''
  });
}

export async function POST(request: NextRequest) {
  try {
    const { key } = await request.json();

    if (!key || !key.trim()) {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 400 }
      );
    }

    // Read existing .env.local file
    let envContent = '';
    try {
      envContent = await fs.readFile(ENV_FILE, 'utf-8');
    } catch (error) {
      // File doesn't exist, create new content
      envContent = '';
    }

    // Update or add OPENAI_API_KEY
    const lines = envContent.split('\n');
    let keyFound = false;

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('OPENAI_API_KEY=')) {
        lines[i] = `OPENAI_API_KEY=${key}`;
        keyFound = true;
        break;
      }
    }

    if (!keyFound) {
      lines.push(`OPENAI_API_KEY=${key}`);
    }

    // Write back to file
    await fs.writeFile(ENV_FILE, lines.join('\n'));

    // Update process.env for current session
    process.env.OPENAI_API_KEY = key;

    return NextResponse.json({
      message: 'API key updated successfully',
      configured: true
    });
  } catch (error) {
    console.error('Error updating API key:', error);
    return NextResponse.json(
      { error: 'Failed to update API key' },
      { status: 500 }
    );
  }
}