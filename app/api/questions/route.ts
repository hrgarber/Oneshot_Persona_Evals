import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const QUESTIONS_FILE = path.join(DATA_DIR, 'questions.json');

async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating data directory:', error);
  }
}

async function loadQuestions() {
  try {
    const content = await fs.readFile(QUESTIONS_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    return [];
  }
}

async function saveQuestions(questions: any[]) {
  await ensureDataDir();
  await fs.writeFile(QUESTIONS_FILE, JSON.stringify(questions, null, 2));
}

export async function GET() {
  try {
    const questions = await loadQuestions();
    return NextResponse.json(questions);
  } catch (error) {
    console.error('Error loading questions:', error);
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  try {
    const newQuestion = await request.json();

    if (!newQuestion.question && !newQuestion.text) {
      return NextResponse.json(
        { error: 'Question text is required' },
        { status: 400 }
      );
    }

    const questions = await loadQuestions();

    const question = {
      id: newQuestion.id || `q${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      question: newQuestion.question || newQuestion.text,
      text: newQuestion.question || newQuestion.text, // Support both formats
      category: newQuestion.category,
      created_at: new Date().toISOString()
    };

    questions.push(question);
    await saveQuestions(questions);

    return NextResponse.json(question, { status: 201 });
  } catch (error) {
    console.error('Error creating question:', error);
    return NextResponse.json(
      { error: 'Failed to create question' },
      { status: 500 }
    );
  }
}