import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const RESULTS_DIR = path.join(process.cwd(), 'results', 'experiments');

// Ensure results directory exists
async function ensureResultsDir() {
  try {
    await fs.mkdir(RESULTS_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating results directory:', error);
  }
}

export async function GET() {
  try {
    await ensureResultsDir();

    const files = await fs.readdir(RESULTS_DIR);
    const experiments = [];

    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = path.join(RESULTS_DIR, file);
        const content = await fs.readFile(filePath, 'utf-8');
        const data = JSON.parse(content);

        experiments.push({
          id: data.id,
          filename: file,
          timestamp: data.timestamp,
          persona_count: data.personas?.length || 0,
          question_count: data.questions?.length || 0,
          total_responses: data.total_responses || 0,
          successful_responses: data.successful_responses || 0,
          status: data.status
        });
      }
    }

    // Sort by timestamp descending
    experiments.sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return NextResponse.json(experiments);
  } catch (error) {
    console.error('Error loading experiments:', error);
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  try {
    const experiment = await request.json();

    await ensureResultsDir();

    const experimentId = `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const filename = `${experimentId}.json`;
    const filePath = path.join(RESULTS_DIR, filename);

    const experimentData = {
      id: experimentId,
      timestamp: new Date().toISOString(),
      ...experiment
    };

    await fs.writeFile(filePath, JSON.stringify(experimentData, null, 2));

    return NextResponse.json({
      id: experimentId,
      filename,
      message: 'Experiment saved successfully'
    });
  } catch (error) {
    console.error('Error saving experiment:', error);
    return NextResponse.json(
      { error: 'Failed to save experiment' },
      { status: 500 }
    );
  }
}