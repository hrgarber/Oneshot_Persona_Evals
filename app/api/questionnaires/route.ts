import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// HACK: Simplified questionnaire handling for POC
const DATA_FILE = path.join(process.cwd(), 'data', 'questionnaires.json');

async function ensureDataDir() {
  const dir = path.join(process.cwd(), 'data');
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch {}
}

async function loadQuestionnaires() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function saveQuestionnaires(questionnaires: any[]) {
  await ensureDataDir();
  await fs.writeFile(DATA_FILE, JSON.stringify(questionnaires, null, 2));
}

export async function GET() {
  const questionnaires = await loadQuestionnaires();
  return NextResponse.json(questionnaires);
}

export async function POST(request: Request) {
  const body = await request.json();
  const questionnaires = await loadQuestionnaires();

  const newQuestionnaire = {
    id: `q_${Date.now()}`,
    ...body,
    createdAt: new Date().toISOString(),
  };

  questionnaires.push(newQuestionnaire);
  await saveQuestionnaires(questionnaires);

  return NextResponse.json(newQuestionnaire, { status: 201 });
}