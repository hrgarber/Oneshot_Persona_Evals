'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { PersonaGrid } from './PersonaGrid';
import { QuestionnaireGrid } from './QuestionnaireGrid';
import ExperimentControls from './ExperimentControls';

interface Persona {
  id: string;
  name: string;
  description: string;
  behavioral_profile?: string;
}

interface Questionnaire {
  id: string;
  name: string;
  questions: string[];
}

interface ExperimentResult {
  persona_id: string;
  question_id: string;
  response: string;
  timestamp: string;
  error?: string;
}


interface ExperimentStatus {
  id: string;
  status: 'running' | 'completed' | 'error';
  currentPersona?: number;
  currentPersonaName?: string;
  totalPersonas: number;
  totalQuestions: number;
  results?: ExperimentResult[];
}

export function ExperimentRunner() {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [selectedPersonas, setSelectedPersonas] = useState<string[]>([]);
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<string>('');
  const [apiConfigured, setApiConfigured] = useState(false);
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState('');
  const [experimentId, setExperimentId] = useState<string | null>(null);
  const [experimentStatus, setExperimentStatus] = useState<ExperimentStatus | null>(null);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchData();
    checkApiKey();
  }, []);

  useEffect(() => {
    // Cleanup polling on unmount
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  const fetchData = async () => {
    try {
      const [personasRes, questionnairesRes] = await Promise.all([
        fetch('/api/personas'),
        fetch('/api/questionnaires'),
      ]);

      setPersonas(await personasRes.json());
      setQuestionnaires(await questionnairesRes.json());
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  const checkApiKey = async () => {
    try {
      const res = await fetch('/api/config/openai');
      const data = await res.json();
      setApiConfigured(data.configured);
    } catch (error) {
      console.error('Failed to check API key:', error);
    }
  };


  const pollExperimentStatus = (expId: string) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/run-experiment?id=${expId}`);
        const data = await res.json();
        setExperimentStatus(data);

        if (data.status === 'completed' || data.status === 'error') {
          clearInterval(interval);
          setPollingInterval(null);
          setRunning(false);
          setStatus(data.status === 'completed' ? 'Experiment completed!' : 'Experiment failed');
        }
      } catch (error) {
        console.error('Failed to poll status:', error);
      }
    }, 2000); // Poll every 2 seconds

    setPollingInterval(interval);
  };

  const handlePersonaToggle = (id: string) => {
    setSelectedPersonas(prev =>
      prev.includes(id)
        ? prev.filter(p => p !== id)
        : [...prev, id]
    );
  };

  const handleRun = async (config: any) => {
    if (!selectedQuestionnaire || selectedPersonas.length === 0) {
      setStatus('Please select at least one persona and a questionnaire');
      return;
    }

    if (!apiConfigured) {
      setStatus('Please configure OpenAI API key in Settings (gear icon)');
      return;
    }

    setRunning(true);
    setStatus('Starting experiment...');
    setExperimentStatus(null);

    try {
      const res = await fetch('/api/run-experiment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personaIds: selectedPersonas,
          questionnaireId: selectedQuestionnaire,
          model: config.model || 'gpt-5-mini',
          enableAnalysis: config.enableAnalysis || false
        })
      });

      if (res.ok) {
        const data = await res.json();
        setExperimentId(data.experimentId);
        setStatus(`Experiment started: ${data.totalPersonas} personas, ${data.totalQuestions} questions`);
        pollExperimentStatus(data.experimentId);
      } else {
        const error = await res.json();
        setStatus(`Failed to start: ${error.error}`);
        setRunning(false);
      }
    } catch {
      setStatus('Failed to start experiment');
      setRunning(false);
    }
  };

  const selectedQuestionnaireData = questionnaires.find(q => q.id === selectedQuestionnaire);
  const questionCount = selectedQuestionnaireData?.questions?.length || 0;

  return (
    <div className="space-y-6">
      {/* Configuration Status */}
      {!apiConfigured && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            OpenAI API key not configured. Please configure it in Settings (gear icon in top right).
          </p>
        </div>
      )}

      {/* Persona Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Personas</CardTitle>
          <CardDescription>Choose which personas to analyze in this experiment</CardDescription>
        </CardHeader>
        <CardContent>
          <PersonaGrid
            personas={personas}
            selectedPersonas={selectedPersonas}
            onPersonaToggle={handlePersonaToggle}
            disabled={running}
          />
        </CardContent>
      </Card>

      {/* Questionnaire Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Questionnaire</CardTitle>
          <CardDescription>Choose the questionnaire to use for analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <QuestionnaireGrid
            questionnaires={questionnaires}
            selectedQuestionnaire={selectedQuestionnaire}
            onQuestionnaireSelect={setSelectedQuestionnaire}
            disabled={running}
          />
        </CardContent>
      </Card>

      {/* Experiment Controls */}
      <ExperimentControls
        selectedPersonas={selectedPersonas}
        selectedQuestionnaire={selectedQuestionnaire}
        questionCount={questionCount}
        onRunExperiment={handleRun}
        isRunning={running}
      />

      {/* Status Display */}
      {status && (
        <div className="flex justify-center">
          <Badge variant={running ? 'default' : 'secondary'} className="text-sm px-4 py-2">
            {status}
          </Badge>
        </div>
      )}

      {/* Experiment Progress */}
      {experimentStatus && (
        <Card>
          <CardHeader>
            <CardTitle>Experiment Progress</CardTitle>
            <CardDescription>
              {experimentStatus.status === 'running' ? 'Processing personas...' :
               experimentStatus.status === 'completed' ? 'Experiment completed' : 'Experiment failed'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {experimentStatus.status === 'running' && (
              <>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Current Persona: {experimentStatus.currentPersonaName || 'Starting...'}</span>
                    <span>{experimentStatus.currentPersona || 0} / {experimentStatus.totalPersonas}</span>
                  </div>
                  <Progress
                    value={(experimentStatus.currentPersona || 0) / experimentStatus.totalPersonas * 100}
                  />
                </div>
                <p className="text-sm text-gray-600">
                  Testing {experimentStatus.totalQuestions} questions per persona
                </p>
              </>
            )}

            {experimentStatus.status === 'completed' && experimentStatus.results && (
              <div className="space-y-2">
                <p className="text-sm font-medium">
                  Total Responses: {experimentStatus.results.length}
                </p>
                <p className="text-sm">
                  Successful: {experimentStatus.results.filter((r: ExperimentResult) => !r.error).length}
                </p>
                <p className="text-sm">
                  Failed: {experimentStatus.results.filter((r: ExperimentResult) => r.error).length}
                </p>
                <Button
                  onClick={() => window.open(`/api/experiments/${experimentId}`, '_blank')}
                  variant="outline"
                  className="mt-4"
                >
                  Download Results (JSON)
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}