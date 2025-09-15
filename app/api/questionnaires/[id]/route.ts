import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import * as path from 'path';
import { Questionnaire } from '../../../types/api';

const DATA_FILE = path.join(process.cwd(), 'data', 'questionnaires.json');

async function loadQuestionnaires(): Promise<Questionnaire[]> {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function saveQuestionnaires(questionnaires: Questionnaire[]) {
  await fs.writeFile(DATA_FILE, JSON.stringify(questionnaires, null, 2));
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const questionnaires = await loadQuestionnaires();

    const index = questionnaires.findIndex((q: Questionnaire) => q.id === id);
    if (index === -1) {
      return NextResponse.json({ error: 'Questionnaire not found' }, { status: 404 });
    }

    questionnaires[index] = {
      ...questionnaires[index],
      ...body,
      updated_at: new Date().toISOString(),
    };

    await saveQuestionnaires(questionnaires);
    return NextResponse.json(questionnaires[index]);
  } catch {
    console.error('Error updating questionnaire');
    return NextResponse.json({ error: 'Failed to update questionnaire' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const questionnaires = await loadQuestionnaires();
    const filtered = questionnaires.filter((q: Questionnaire) => q.id !== id);

    if (filtered.length === questionnaires.length) {
      return NextResponse.json({ error: 'Questionnaire not found' }, { status: 404 });
    }

    await saveQuestionnaires(filtered);
    return NextResponse.json({ success: true });
  } catch {
    console.error('Error deleting questionnaire');
    return NextResponse.json({ error: 'Failed to delete questionnaire' }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const questionnaires = await loadQuestionnaires();
    const questionnaire = questionnaires.find((q: Questionnaire) => q.id === id);

    if (!questionnaire) {
      return NextResponse.json({ error: 'Questionnaire not found' }, { status: 404 });
    }

    return NextResponse.json(questionnaire);
  } catch {
    console.error('Error fetching questionnaire');
    return NextResponse.json({ error: 'Failed to fetch questionnaire' }, { status: 500 });
  }
}