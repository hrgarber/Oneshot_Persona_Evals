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

    // Validate the API key format
    if (!key.startsWith('sk-') && !key.startsWith('sk-proj-')) {
      return NextResponse.json(
        { error: 'Invalid OpenAI API key format' },
        { status: 400 }
      );
    }

    // In production (Vercel), environment variables must be set through dashboard
    // In development, try to update .env.local
    if (process.env.NODE_ENV === 'development') {
      try {
        // Read existing .env.local file
        let envContent = '';
        try {
          envContent = await fs.readFile(ENV_FILE, 'utf-8');
        } catch {
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
      } catch (error) {
        console.error('Failed to update .env.local:', error);
      }
    }

    // Update process.env for current session (works in both dev and production)
    process.env.OPENAI_API_KEY = key;

    return NextResponse.json({
      message: process.env.NODE_ENV === 'production'
        ? 'API key configured for this session. For persistent storage, add OPENAI_API_KEY to Vercel environment variables.'
        : 'API key updated successfully',
      configured: true,
      temporary: process.env.NODE_ENV === 'production'
    });
  } catch (error) {
    console.error('Error updating API key:', error);
    return NextResponse.json(
      { error: 'Failed to update API key' },
      { status: 500 }
    );
  }
}