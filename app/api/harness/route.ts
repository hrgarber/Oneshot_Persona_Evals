import { NextRequest, NextResponse } from 'next/server';
import llmService from '@/lib/llm-service';

export async function POST(request: NextRequest) {
  try {
    const { persona, question, model = 'gpt-4o-mini' } = await request.json();

    if (!persona || !question) {
      return NextResponse.json(
        { error: 'Missing persona or question' },
        { status: 400 }
      );
    }

    const systemPrompt = `You are roleplaying as: ${persona.name}

${persona.description}

${persona.behavioral_profile || ''}

Respond to questions from this persona's perspective. Be authentic to this role.`;

    // Use unified LLM service
    const response = await llmService.chat(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: question.text || question.question }
      ],
      {
        model,
        temperature: 0.1
      }
    );

    const result = {
      persona_name: persona.name,
      persona_id: persona.id,
      question_id: question.id,
      question_text: question.text || question.question,
      response: response.content,
      timestamp: new Date().toISOString(),
      model: response.model,
      provider: response.provider,
      usage: response.usage
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Harness error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}