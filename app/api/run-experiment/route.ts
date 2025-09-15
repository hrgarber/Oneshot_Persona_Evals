import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import llmService from '@/lib/llm-service';

const DATA_DIR = path.join(process.cwd(), 'data');
const RESULTS_DIR = path.join(process.cwd(), 'results', 'experiments');

// HACK: Simple in-memory experiment state for MVP
const runningExperiments = new Map();

async function loadPersonas() {
  try {
    const content = await fs.readFile(path.join(DATA_DIR, 'personas.json'), 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    return [];
  }
}

async function loadQuestionnaire(id: string) {
  try {
    const questionnairesContent = await fs.readFile(path.join(DATA_DIR, 'questionnaires.json'), 'utf-8');
    const questionnaires = JSON.parse(questionnairesContent);
    const questionnaire = questionnaires.find((q: any) => q.id === id);

    if (!questionnaire) return null;

    // Load questions
    const questionsContent = await fs.readFile(path.join(DATA_DIR, 'questions.json'), 'utf-8');
    const allQuestions = JSON.parse(questionsContent);

    // Resolve questions
    const questions = questionnaire.questions.map((qId: string) => {
      return allQuestions.find((q: any) => q.id === qId) || { id: qId, question: 'Question not found' };
    });

    return { ...questionnaire, resolved_questions: questions };
  } catch (error) {
    return null;
  }
}

async function testPersona(persona: any, questions: any[], model: string = 'gpt-4o-mini') {
  const results = [];

  // Test each question sequentially
  for (const question of questions) {
    try {
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
          temperature: 0.7,
          max_tokens: 1000
        }
      );

      results.push({
        persona_name: persona.name,
        persona_id: persona.id,
        question_id: question.id,
        question_text: question.text || question.question,
        response: response.content,
        timestamp: new Date().toISOString(),
        model: response.model,
        provider: response.provider,
        usage: response.usage
      });
    } catch (error) {
      results.push({
        persona_name: persona.name,
        persona_id: persona.id,
        question_id: question.id,
        question_text: question.text || question.question,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  }

  return results;
}

export async function POST(request: NextRequest) {
  try {
    const { personaIds, questionnaireId, model = 'gpt-4o-mini' } = await request.json();

    if (!personaIds || !personaIds.length || !questionnaireId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Load data
    const allPersonas = await loadPersonas();
    const questionnaire = await loadQuestionnaire(questionnaireId);

    if (!questionnaire) {
      return NextResponse.json(
        { error: 'Questionnaire not found' },
        { status: 404 }
      );
    }

    const personas = allPersonas.filter((p: any) => personaIds.includes(p.id));

    if (personas.length === 0) {
      return NextResponse.json(
        { error: 'No valid personas found' },
        { status: 404 }
      );
    }

    const experimentId = `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Store experiment as running
    runningExperiments.set(experimentId, {
      id: experimentId,
      status: 'running',
      startTime: new Date().toISOString(),
      totalPersonas: personas.length,
      totalQuestions: questionnaire.resolved_questions.length,
      currentPersona: 0,
      results: []
    });

    // Run experiment asynchronously
    (async () => {
      const allResults = [];

      for (let i = 0; i < personas.length; i++) {
        const persona = personas[i];

        // Update status
        const experiment = runningExperiments.get(experimentId);
        if (experiment) {
          experiment.currentPersona = i + 1;
          experiment.currentPersonaName = persona.name;
        }

        // Test persona
        const personaResults = await testPersona(persona, questionnaire.resolved_questions, model);
        allResults.push(...personaResults);
      }

      // Save results
      await fs.mkdir(RESULTS_DIR, { recursive: true });

      const experimentData = {
        id: experimentId,
        timestamp: new Date().toISOString(),
        status: 'completed',
        personas: personas.map((p: any) => ({ id: p.id, name: p.name })),
        questionnaire: { id: questionnaire.id, name: questionnaire.name },
        questions: questionnaire.resolved_questions,
        model,
        total_responses: allResults.length,
        successful_responses: allResults.filter((r: any) => !r.error).length,
        results: allResults
      };

      await fs.writeFile(
        path.join(RESULTS_DIR, `${experimentId}.json`),
        JSON.stringify(experimentData, null, 2)
      );

      // Update status
      const experiment = runningExperiments.get(experimentId);
      if (experiment) {
        experiment.status = 'completed';
        experiment.endTime = new Date().toISOString();
        experiment.results = allResults;
      }
    })();

    return NextResponse.json({
      experimentId,
      message: 'Experiment started',
      totalPersonas: personas.length,
      totalQuestions: questionnaire.resolved_questions.length
    });
  } catch (error) {
    console.error('Error starting experiment:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to start experiment' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const experimentId = url.searchParams.get('id');

  if (experimentId) {
    const experiment = runningExperiments.get(experimentId);
    if (experiment) {
      return NextResponse.json(experiment);
    }

    // Try to load from file if not in memory
    try {
      const filePath = path.join(RESULTS_DIR, `${experimentId}.json`);
      const content = await fs.readFile(filePath, 'utf-8');
      return NextResponse.json(JSON.parse(content));
    } catch (error) {
      return NextResponse.json(
        { error: 'Experiment not found' },
        { status: 404 }
      );
    }
  }

  // Return all running experiments
  const experiments = Array.from(runningExperiments.values());
  return NextResponse.json(experiments);
}