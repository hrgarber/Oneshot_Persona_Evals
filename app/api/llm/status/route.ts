import { NextResponse } from 'next/server';
import llmService from '@/lib/llm-service';

export async function GET() {
  try {
    const status = await llmService.getStatus();
    return NextResponse.json(status);
  } catch (error) {
    console.error('Error getting LLM status:', error);
    return NextResponse.json(
      { error: 'Failed to get LLM status' },
      { status: 500 }
    );
  }
}