'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';

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

interface ExperimentStatus {
  id: string;
  status: 'running' | 'completed' | 'error';
  currentPersona?: number;
  currentPersonaName?: string;
  totalPersonas: number;
  totalQuestions: number;
  results?: any[];
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

  const handleRun = async () => {
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
          model: 'gpt-4o-mini'
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configure Experiment</CardTitle>
          <CardDescription>Select personas and questionnaire to run</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Configuration Status */}
          {!apiConfigured && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                OpenAI API key not configured. Please configure it in Settings (gear icon in top right).
              </p>
            </div>
          )}

          {/* Persona Selection */}
          <div>
            <Label className="text-base font-semibold mb-3 block">Select Personas</Label>
            <div className="space-y-2">
              {personas.map((persona) => (
                <div key={persona.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={persona.id}
                    checked={selectedPersonas.includes(persona.id)}
                    onChange={() => handlePersonaToggle(persona.id)}
                    className="rounded"
                  />
                  <label htmlFor={persona.id} className="flex-1 cursor-pointer">
                    {persona.name}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Questionnaire Selection */}
          <div>
            <Label className="text-base font-semibold mb-3 block">Select Questionnaire</Label>
            <div className="space-y-2">
              {questionnaires.map((q) => (
                <div key={q.id} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id={q.id}
                    name="questionnaire"
                    checked={selectedQuestionnaire === q.id}
                    onChange={() => setSelectedQuestionnaire(q.id)}
                    className="rounded"
                  />
                  <label htmlFor={q.id} className="flex-1 cursor-pointer">
                    {q.name} ({q.questions.length} questions)
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Run Button */}
          <div className="flex items-center justify-between">
            <Button
              onClick={handleRun}
              disabled={running}
              size="lg"
            >
              {running ? 'Running...' : 'Start Experiment'}
            </Button>
            {status && (
              <Badge variant={running ? 'default' : 'secondary'}>
                {status}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

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
                  Successful: {experimentStatus.results.filter((r: { error?: unknown }) => !r.error).length}
                </p>
                <p className="text-sm">
                  Failed: {experimentStatus.results.filter((r: { error?: unknown }) => r.error).length}
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