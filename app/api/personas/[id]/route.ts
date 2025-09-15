import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'personas.json');

async function loadPersonas() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function savePersonas(personas: any[]) {
  await fs.writeFile(DATA_FILE, JSON.stringify(personas, null, 2));
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  const personas = await loadPersonas();

  const index = personas.findIndex((p: any) => p.id === params.id);
  if (index === -1) {
    return NextResponse.json({ error: 'Persona not found' }, { status: 404 });
  }

  personas[index] = { ...personas[index], ...body };
  await savePersonas(personas);

  return NextResponse.json(personas[index]);
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const personas = await loadPersonas();
  const filtered = personas.filter((p: any) => p.id !== params.id);

  await savePersonas(filtered);

  return NextResponse.json({ message: 'Deleted' });
}