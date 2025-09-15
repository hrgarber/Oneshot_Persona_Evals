'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AnalysisView } from '@/components/AnalysisView';

// Raw data view component
function RawDataView({ experiment }: { experiment: ExperimentDetails }) {
  return (
    <div className="space-y-4">
      {/* Group by persona */}
      {experiment.personas.map(persona => {
        const personaResponses = experiment.results.filter(r => r.persona_id === persona.id);

        return (
          <Card key={persona.id}>
            <CardHeader>
              <CardTitle className="text-lg">{persona.name}</CardTitle>
              <CardDescription>
                {personaResponses.length} responses •
                {personaResponses.filter(r => !r.error).length} successful
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {personaResponses.map((response, idx) => (
                  <div key={idx} className="border rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-sm font-medium text-gray-700">
                        Q{idx + 1}: {response.question_text}
                      </p>
                      <Badge variant={response.error ? 'destructive' : 'default'} className="text-xs">
                        {response.error ? 'Failed' : response.model}
                      </Badge>
                    </div>
                    {response.response ? (
                      <p className="text-sm text-gray-600 whitespace-pre-wrap">
                        {response.response}
                      </p>
                    ) : (
                      <p className="text-sm text-red-500">Error: {response.error}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(response.timestamp).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

interface ExperimentSummary {
  id: string;
  filename: string;
  timestamp: string;
  persona_count: number;
  question_count: number;
  total_responses: number;
  successful_responses: number;
  status: string;
}

interface ExperimentDetails {
  id: string;
  timestamp: string;
  personas: Array<{ id: string; name: string }>;
  questionnaire: { id: string; name: string };
  questions: any[];
  results: Array<{
    persona_name: string;
    persona_id: string;
    question_id: string;
    question_text: string;
    response: string;
    error?: string;
    timestamp: string;
    model: string;
  }>;
}

export function ResultsViewer() {
  const [experiments, setExperiments] = useState<ExperimentSummary[]>([]);
  const [selectedExperiment, setSelectedExperiment] = useState<ExperimentDetails | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'raw' | 'analysis'>('analysis'); // Toggle between raw and analysis

  useEffect(() => {
    fetchExperiments();
  }, []);

  const fetchExperiments = async () => {
    try {
      const res = await fetch('/api/experiments');
      const data = await res.json();
      setExperiments(data);
    } catch (error) {
      console.error('Failed to fetch experiments:', error);
    }
  };

  const loadExperimentDetails = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/experiments/${id}`);
      const data = await res.json();
      setSelectedExperiment(data);
      setShowDetails(true);
    } catch (error) {
      console.error('Failed to load experiment details:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteExperiment = async (id: string) => {
    if (!confirm('Delete this experiment?')) return;

    try {
      const res = await fetch(`/api/experiments/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchExperiments();
      }
    } catch (error) {
      console.error('Failed to delete experiment:', error);
    }
  };

  const exportAsJSON = (experiment: ExperimentDetails) => {
    const dataStr = JSON.stringify(experiment, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `experiment_${experiment.id}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const exportAsCSV = (experiment: ExperimentDetails) => {
    const headers = ['Persona ID', 'Persona Name', 'Question ID', 'Question', 'Response', 'Model', 'Timestamp', 'Error'];
    const rows = experiment.results.map(r => [
      r.persona_id,
      r.persona_name,
      r.question_id,
      r.question_text,
      r.response || '',
      r.model,
      r.timestamp,
      r.error || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const dataUri = 'data:text/csv;charset=utf-8,'+ encodeURIComponent(csvContent);
    const exportFileDefaultName = `experiment_${experiment.id}.csv`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Experiment Results</CardTitle>
          <CardDescription>View raw responses and behavioral analysis from past experiments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {experiments.length === 0 ? (
              <p className="text-gray-500">No experiments yet</p>
            ) : (
              experiments.map((exp) => (
                <div key={exp.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{exp.id}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(exp.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <Badge variant={exp.status === 'completed' ? 'default' : 'secondary'}>
                      {exp.status}
                    </Badge>
                  </div>

                  <div className="flex gap-4 text-sm text-gray-600">
                    <span>{exp.persona_count} personas</span>
                    <span>{exp.question_count} questions</span>
                    <span>{exp.successful_responses}/{exp.total_responses} successful</span>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      onClick={() => loadExperimentDetails(exp.id)}
                      disabled={loading}
                    >
                      View Details
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteExperiment(exp.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {viewMode === 'analysis' ? 'Behavioral Analysis' : 'Raw Experiment Data'}
            </DialogTitle>
            <DialogDescription>
              <div className="flex items-center justify-between">
                <span>Experiment {selectedExperiment?.id}</span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={viewMode === 'raw' ? 'default' : 'outline'}
                    onClick={() => setViewMode('raw')}
                  >
                    Raw Data
                  </Button>
                  <Button
                    size="sm"
                    variant={viewMode === 'analysis' ? 'default' : 'outline'}
                    onClick={() => setViewMode('analysis')}
                  >
                    Analysis
                  </Button>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>

          {selectedExperiment && (
            <div className="mt-4">
              {viewMode === 'analysis' ? (
                <AnalysisView experiment={selectedExperiment} />
              ) : (
                <RawDataView experiment={selectedExperiment} />
              )}

              {/* Export Buttons */}
              <div className="flex gap-2 mt-6 pt-4 border-t">
                <Button onClick={() => exportAsJSON(selectedExperiment)}>Export JSON</Button>
                <Button onClick={() => exportAsCSV(selectedExperiment)} variant="outline">Export CSV</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}