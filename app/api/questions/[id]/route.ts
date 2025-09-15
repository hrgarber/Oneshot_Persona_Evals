import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import * as path from 'path';
import { Question } from '../../../types/api';

const DATA_DIR = path.join(process.cwd(), 'data');
const QUESTIONS_FILE = path.join(DATA_DIR, 'questions.json');

async function loadQuestions(): Promise<Question[]> {
  try {
    const content = await fs.readFile(QUESTIONS_FILE, 'utf-8');
    return JSON.parse(content);
  } catch {
    return [];
  }
}

async function saveQuestions(questions: Question[]) {
  await fs.writeFile(QUESTIONS_FILE, JSON.stringify(questions, null, 2));
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const questions = await loadQuestions();
    const question = questions.find((q: Question) => q.id === id);

    if (!question) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(question);
  } catch {
    console.error('Error loading question');
    return NextResponse.json(
      { error: 'Failed to load question' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const updatedQuestion = await request.json();
    const questions = await loadQuestions();
    const index = questions.findIndex((q: Question) => q.id === id);

    if (index === -1) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      );
    }

    questions[index] = {
      ...questions[index],
      ...updatedQuestion,
      updated_at: new Date().toISOString()
    };

    await saveQuestions(questions);

    return NextResponse.json(questions[index]);
  } catch {
    console.error('Error updating question');
    return NextResponse.json(
      { error: 'Failed to update question' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const questions = await loadQuestions();
    const filteredQuestions = questions.filter((q: Question) => q.id !== id);

    if (questions.length === filteredQuestions.length) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      );
    }

    await saveQuestions(filteredQuestions);

    return NextResponse.json({ message: 'Question deleted successfully' });
  } catch {
    console.error('Error deleting question');
    return NextResponse.json(
      { error: 'Failed to delete question' },
      { status: 500 }
    );
  }
}