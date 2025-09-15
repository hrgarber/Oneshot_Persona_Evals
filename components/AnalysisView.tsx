'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// ScrollArea removed - using div with overflow instead

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

interface AnalysisViewProps {
  experiment: ExperimentDetails;
}

export function AnalysisView({ experiment }: AnalysisViewProps) {
  // Group responses by persona
  const responsesByPersona = experiment.results.reduce((acc, result) => {
    if (!acc[result.persona_id]) {
      acc[result.persona_id] = {
        name: result.persona_name,
        responses: []
      };
    }
    acc[result.persona_id].responses.push(result);
    return acc;
  }, {} as Record<string, { name: string; responses: typeof experiment.results }>);

  // Enhanced behavioral analysis with scoring rubric
  const analyzeBehavior = (responses: typeof experiment.results) => {
    // Define rubric with weighted keywords
    const rubric = {
      pragmatism: {
        strong: ['mvp', 'minimum viable', 'good enough', 'ship it', 'validate first'],
        moderate: ['practical', 'simple', 'straightforward', 'focus'],
        weak: ['workable', 'basic', 'start']
      },
      perfectionism: {
        strong: ['perfect', 'comprehensive', 'complete solution', 'all cases', 'fully'],
        moderate: ['thorough', 'detailed', 'careful', 'polish'],
        weak: ['complete', 'finish', 'done']
      },
      speed_focus: {
        strong: ['asap', 'immediately', 'ship fast', 'quick win', 'rapid'],
        moderate: ['quick', 'fast', 'iterate', 'deploy'],
        weak: ['soon', 'speed', 'time']
      },
      quality_focus: {
        strong: ['test coverage', 'code review', 'best practices', 'maintainable', 'scalable'],
        moderate: ['quality', 'testing', 'robust', 'reliable'],
        weak: ['clean', 'good', 'solid']
      },
      risk_tolerance: {
        strong: ['experiment', 'fail fast', 'try it', 'pivot', 'hypothesis'],
        moderate: ['explore', 'test', 'prototype', 'pilot'],
        weak: ['consider', 'maybe', 'could']
      },
      user_centric: {
        strong: ['user feedback', 'customer needs', 'user experience', 'pain point', 'user story'],
        moderate: ['user', 'customer', 'feedback', 'usability'],
        weak: ['people', 'they', 'someone']
      }
    };

    const scores: Record<string, number> = {};

    // Calculate weighted scores
    Object.entries(rubric).forEach(([trait, keywords]) => {
      let score = 0;
      let maxPossible = 0;

      responses.forEach(r => {
        if (!r.response) return;
        const text = r.response.toLowerCase();

        // Check for strong indicators (3 points)
        keywords.strong.forEach(keyword => {
          if (text.includes(keyword)) score += 3;
        });

        // Check for moderate indicators (2 points)
        keywords.moderate.forEach(keyword => {
          if (text.includes(keyword)) score += 2;
        });

        // Check for weak indicators (1 point)
        keywords.weak.forEach(keyword => {
          if (text.includes(keyword)) score += 1;
        });

        // Max possible score per response (if all keywords matched)
        maxPossible += (keywords.strong.length * 3 + keywords.moderate.length * 2 + keywords.weak.length);
      });

      // Normalize to percentage
      scores[trait] = maxPossible > 0 ? Math.round((score / maxPossible) * 100) : 0;
    });

    return scores;
  };

  // Get dominant trait
  const getDominantTrait = (patterns: ReturnType<typeof analyzeBehavior>) => {
    const sorted = Object.entries(patterns).sort(([,a], [,b]) => b - a);
    const [trait, score] = sorted[0];
    return { trait: trait.replace('_', ' ').toUpperCase(), score };
  };

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>Experiment Analysis</CardTitle>
          <CardDescription>
            {experiment.questionnaire.name} • {experiment.personas.length} personas • {experiment.questions.length} questions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Total Responses:</span>
              <p className="font-semibold">{experiment.results.length}</p>
            </div>
            <div>
              <span className="text-gray-500">Success Rate:</span>
              <p className="font-semibold">
                {Math.round((experiment.results.filter(r => !r.error).length / experiment.results.length) * 100)}%
              </p>
            </div>
            <div>
              <span className="text-gray-500">Model Used:</span>
              <p className="font-semibold">{experiment.results[0]?.model || 'Unknown'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Behavioral Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Behavioral Analysis</CardTitle>
          <CardDescription>Identified patterns across persona responses</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={Object.keys(responsesByPersona)[0]} className="w-full">
            <TabsList className="grid grid-cols-auto">
              {Object.entries(responsesByPersona).map(([id, data]) => (
                <TabsTrigger key={id} value={id}>
                  {data.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {Object.entries(responsesByPersona).map(([id, data]) => {
              const patterns = analyzeBehavior(data.responses);
              const dominant = getDominantTrait(patterns);

              return (
                <TabsContent key={id} value={id} className="space-y-4">
                  {/* Dominant Trait with Grade */}
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm text-blue-600 mb-1">Dominant Behavioral Trait</p>
                        <p className="text-xl font-bold">{dominant.trait}</p>
                        <p className="text-sm text-gray-600">{dominant.score}% alignment with trait indicators</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Overall Grade</p>
                        <p className="text-2xl font-bold">
                          {dominant.score >= 80 ? 'A' : dominant.score >= 60 ? 'B' : dominant.score >= 40 ? 'C' : dominant.score >= 20 ? 'D' : 'F'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Trait Breakdown */}
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(patterns).map(([trait, score]) => (
                      <div key={trait} className="flex items-center justify-between p-3 border rounded-lg">
                        <span className="text-sm capitalize">{trait.replace('_', ' ')}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${score}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{score}%</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Key Responses */}
                  <div className="mt-6">
                    <h4 className="font-semibold mb-3">Key Responses</h4>
                    <div className="h-96 overflow-y-auto border rounded-lg p-4">
                      <div className="space-y-4">
                        {data.responses.slice(0, 5).map((response, idx) => (
                          <div key={idx} className="border-l-2 border-blue-500 pl-4">
                            <p className="text-sm font-medium text-gray-700 mb-1">
                              Q: {response.question_text}
                            </p>
                            <p className="text-sm text-gray-600 line-clamp-3">
                              {response.response || <span className="text-red-500">Error: {response.error}</span>}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>
              );
            })}
          </Tabs>
        </CardContent>
      </Card>

      {/* Category Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Response Categories</CardTitle>
          <CardDescription>Breakdown by question category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {experiment.questions.map(q => {
              const responses = experiment.results.filter(r => r.question_id === q.id);
              const successRate = Math.round((responses.filter(r => !r.error).length / responses.length) * 100);

              return (
                <div key={q.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{q.question}</p>
                    <p className="text-xs text-gray-500">Category: {q.category}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={successRate === 100 ? "default" : successRate > 50 ? "secondary" : "destructive"}>
                      {successRate}% success
                    </Badge>
                    <span className="text-sm text-gray-500">{responses.length} responses</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}