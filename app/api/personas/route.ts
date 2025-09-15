import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// HACK: hardcoded data path for validation
const DATA_FILE = path.join(process.cwd(), 'data', 'personas.json');

async function ensureDataDir() {
  const dir = path.join(process.cwd(), 'data');
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch {}
}

async function loadPersonas() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return []; // Return empty if no file
  }
}

async function savePersonas(personas: any[]) {
  await ensureDataDir();
  await fs.writeFile(DATA_FILE, JSON.stringify(personas, null, 2));
}

export async function GET() {
  const personas = await loadPersonas();
  return NextResponse.json(personas);
}

export async function POST(request: Request) {
  const body = await request.json();
  const personas = await loadPersonas();

  // HACK: Simple ID generation for POC
  const newPersona = {
    id: `persona_${Date.now()}`,
    ...body,
  };

  personas.push(newPersona);
  await savePersonas(personas);

  return NextResponse.json(newPersona, { status: 201 });
}