import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import * as path from 'path';
import { Persona } from '../../../types/api';

const DATA_FILE = path.join(process.cwd(), 'data', 'personas.json');

async function loadPersonas(): Promise<Persona[]> {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function savePersonas(personas: Persona[]) {
  await fs.writeFile(DATA_FILE, JSON.stringify(personas, null, 2));
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const personas = await loadPersonas();

  const index = personas.findIndex((p: Persona) => p.id === id);
  if (index === -1) {
    return NextResponse.json({ error: 'Persona not found' }, { status: 404 });
  }

  personas[index] = { ...personas[index], ...body };
  await savePersonas(personas);

  return NextResponse.json(personas[index]);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const personas = await loadPersonas();
  const filtered = personas.filter((p: Persona) => p.id !== id);

  await savePersonas(filtered);

  return NextResponse.json({ message: 'Deleted' });
}