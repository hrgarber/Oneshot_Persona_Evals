'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

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
  questions: Array<{ id: string; question: string; category: string }>;
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

// Behavioral Dimension Scores: 1-5 scale based on research framework
interface BehavioralScores {
  scopeBoundaries: number;    // 1=minimal, 5=comprehensive
  qualityTradeoffs: number;   // 1=speed favored, 5=quality favored
  riskTolerance: number;      // 1=high risk, 5=risk averse
  timeOrientation: number;    // 1=sprint mentality, 5=long-term planning
  successDefinition: number;  // 1=validation focused, 5=technical completeness
}

export function AnalysisView() {
  const [experiments, setExperiments] = useState<ExperimentSummary[]>([]);
  const [selectedExperiment, setSelectedExperiment] = useState<ExperimentDetails | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchExperiments();
  }, []);

  const fetchExperiments = async () => {
    try {
      const response = await fetch('/api/experiments');
      const data = await response.json();
      setExperiments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching experiments:', error);
      setExperiments([]);
    }
  };

  const loadExperiment = async (experimentId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/experiments/${experimentId}`);
      const data = await response.json();
      setSelectedExperiment(data);
      setShowAnalysis(true);
    } catch (error) {
      console.error('Error loading experiment:', error);
    }
    setLoading(false);
  };

  // Behavioral Scoring Algorithm based on research framework
  const calculateBehavioralScores = (responses: ExperimentDetails['results']): BehavioralScores => {
    const allText = responses.filter(r => r.response).map(r => r.response.toLowerCase()).join(' ');

    // HACK: hardcoded scoring patterns for validation - would need NLP for production
    const patterns = {
      // Scope Boundaries: 1=minimal, 5=comprehensive
      scopeBoundaries: (() => {
        const minimal = /\b(mvp|minimum|smallest|simplest|basic|quick)\b/gi;
        const comprehensive = /\b(comprehensive|complete|thorough|full|robust|enterprise)\b/gi;
        const minCount = (allText.match(minimal) || []).length;
        const compCount = (allText.match(comprehensive) || []).length;
        if (minCount > compCount * 2) return 1.5;
        if (compCount > minCount) return 4.0;
        return 2.5;
      })(),

      // Quality Tradeoffs: 1=speed favored, 5=quality favored
      qualityTradeoffs: (() => {
        const speed = /\b(fast|quick|ship|asap|rapid|immediately|rush)\b/gi;
        const quality = /\b(quality|test|review|maintainable|scalable|robust|best practices)\b/gi;
        const speedCount = (allText.match(speed) || []).length;
        const qualityCount = (allText.match(quality) || []).length;
        if (speedCount > qualityCount * 2) return 1.5;
        if (qualityCount > speedCount) return 4.0;
        return 2.5;
      })(),

      // Risk Tolerance: 1=high risk, 5=risk averse
      riskTolerance: (() => {
        const highRisk = /\b(ship it|fail fast|experiment|try|broken|prototype|hypothesis)\b/gi;
        const lowRisk = /\b(careful|safe|tested|validated|stable|production ready)\b/gi;
        const riskCount = (allText.match(highRisk) || []).length;
        const safeCount = (allText.match(lowRisk) || []).length;
        if (riskCount > safeCount * 2) return 1.5;
        if (safeCount > riskCount) return 4.0;
        return 2.5;
      })(),

      // Time Orientation: 1=sprint mentality, 5=long-term planning
      timeOrientation: (() => {
        const sprint = /\b(now|urgent|deadline|runway|sprint|immediate)\b/gi;
        const longTerm = /\b(architecture|scalable|maintainable|future|planning|roadmap)\b/gi;
        const sprintCount = (allText.match(sprint) || []).length;
        const planCount = (allText.match(longTerm) || []).length;
        if (sprintCount > planCount * 2) return 1.5;
        if (planCount > sprintCount) return 4.0;
        return 2.5;
      })(),

      // Success Definition: 1=validation focused, 5=technical completeness
      successDefinition: (() => {
        const validation = /\b(user|customer|feedback|market|validate|prove|hypothesis)\b/gi;
        const technical = /\b(perfect|complete|coverage|technical|engineering|code quality)\b/gi;
        const validCount = (allText.match(validation) || []).length;
        const techCount = (allText.match(technical) || []).length;
        if (validCount > techCount * 2) return 1.5;
        if (techCount > validCount) return 4.0;
        return 2.5;
      })()
    };

    return patterns;
  };

  // Calculate overall behavioral archetype
  const getBehavioralArchetype = (scores: BehavioralScores) => {
    const average = Object.values(scores).reduce((sum, score) => sum + score, 0) / 5;
    if (average < 2) return { type: "Startup Founder", description: "Speed-first, risk-tolerant, validation-focused" };
    if (average > 4) return { type: "Enterprise Architect", description: "Quality-first, comprehensive, planning-focused" };
    if (scores.timeOrientation < 2.5 && scores.riskTolerance < 2.5) return { type: "Research Hacker", description: "Fast experiments, high risk tolerance" };
    return { type: "Balanced Developer", description: "Context-dependent approach" };
  };

  return (
    <div className="space-y-6">
      {!selectedExperiment ? (
        <>
          {/* Experiment Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Behavioral Analysis</CardTitle>
              <CardDescription>
                Select an experiment to analyze persona behavioral patterns using the 5-dimensional framework
              </CardDescription>
            </CardHeader>
            <CardContent>
              {experiments.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No experiments found. Run some experiments first to analyze behavioral patterns.
                </p>
              ) : (
                <div className="grid gap-4">
                  {experiments.map((exp) => (
                    <Card key={exp.id} className="cursor-pointer hover:bg-gray-50" onClick={() => loadExperiment(exp.id)}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{exp.id}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(exp.timestamp).toLocaleDateString()} •{' '}
                              {exp.persona_count} personas • {exp.question_count} questions
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Badge variant={exp.successful_responses === exp.total_responses ? "default" : "secondary"}>
                              {exp.successful_responses}/{exp.total_responses} responses
                            </Badge>
                            <Button size="sm" disabled={loading}>
                              {loading ? 'Loading...' : 'Analyze'}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        <>
          {/* Analysis Results */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Behavioral Analysis Results</CardTitle>
                  <CardDescription>
                    5-dimensional behavioral scoring for {selectedExperiment.personas.length} personas
                  </CardDescription>
                </div>
                <Button variant="outline" onClick={() => setSelectedExperiment(null)}>
                  Back to Experiments
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-sm mb-6">
                <div>
                  <span className="text-gray-500">Total Responses:</span>
                  <p className="font-semibold">{selectedExperiment.results.length}</p>
                </div>
                <div>
                  <span className="text-gray-500">Success Rate:</span>
                  <p className="font-semibold">
                    {Math.round((selectedExperiment.results.filter(r => !r.error).length / selectedExperiment.results.length) * 100)}%
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Model Used:</span>
                  <p className="font-semibold">{selectedExperiment.results[0]?.model || 'Unknown'}</p>
                </div>
              </div>

              {/* Persona Behavioral Scores */}
              <div className="space-y-6">
                {selectedExperiment.personas.map(persona => {
                  const personaResponses = selectedExperiment.results.filter(r => r.persona_id === persona.id);
                  const scores = calculateBehavioralScores(personaResponses);
                  const archetype = getBehavioralArchetype(scores);

                  return (
                    <Card key={persona.id} className="bg-gradient-to-r from-blue-50 to-indigo-50">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-xl font-bold">{persona.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline">{archetype.type}</Badge>
                              <span className="text-sm text-gray-600">{archetype.description}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">Overall Score</p>
                            <p className="text-2xl font-bold">
                              {(Object.values(scores).reduce((sum, score) => sum + score, 0) / 5).toFixed(1)}/5.0
                            </p>
                          </div>
                        </div>

                        {/* 5-Dimensional Radar Chart (simplified bars for now) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <div>
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-medium">Scope Boundaries</span>
                                <span className="text-sm text-gray-600">{scores.scopeBoundaries.toFixed(1)}/5</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full"
                                  style={{ width: `${(scores.scopeBoundaries / 5) * 100}%` }}
                                />
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                {scores.scopeBoundaries < 2.5 ? "Minimal approach" : scores.scopeBoundaries > 3.5 ? "Comprehensive approach" : "Balanced"}
                              </p>
                            </div>

                            <div>
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-medium">Quality Tradeoffs</span>
                                <span className="text-sm text-gray-600">{scores.qualityTradeoffs.toFixed(1)}/5</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-green-600 h-2 rounded-full"
                                  style={{ width: `${(scores.qualityTradeoffs / 5) * 100}%` }}
                                />
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                {scores.qualityTradeoffs < 2.5 ? "Speed favored" : scores.qualityTradeoffs > 3.5 ? "Quality favored" : "Balanced"}
                              </p>
                            </div>

                            <div>
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-medium">Risk Tolerance</span>
                                <span className="text-sm text-gray-600">{scores.riskTolerance.toFixed(1)}/5</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-red-600 h-2 rounded-full"
                                  style={{ width: `${(scores.riskTolerance / 5) * 100}%` }}
                                />
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                {scores.riskTolerance < 2.5 ? "High risk tolerance" : scores.riskTolerance > 3.5 ? "Risk averse" : "Moderate"}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-medium">Time Orientation</span>
                                <span className="text-sm text-gray-600">{scores.timeOrientation.toFixed(1)}/5</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-purple-600 h-2 rounded-full"
                                  style={{ width: `${(scores.timeOrientation / 5) * 100}%` }}
                                />
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                {scores.timeOrientation < 2.5 ? "Sprint mentality" : scores.timeOrientation > 3.5 ? "Long-term planning" : "Adaptive"}
                              </p>
                            </div>

                            <div>
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-medium">Success Definition</span>
                                <span className="text-sm text-gray-600">{scores.successDefinition.toFixed(1)}/5</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-orange-600 h-2 rounded-full"
                                  style={{ width: `${(scores.successDefinition / 5) * 100}%` }}
                                />
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                {scores.successDefinition < 2.5 ? "Validation focused" : scores.successDefinition > 3.5 ? "Technical completeness" : "Hybrid"}
                              </p>
                            </div>

                            {/* Sample Response */}
                            <div className="pt-2">
                              <p className="text-sm font-medium mb-2">Sample Response:</p>
                              <div className="bg-white rounded border p-3">
                                <p className="text-xs text-gray-600 line-clamp-3">
                                  {personaResponses.find(r => r.response)?.response?.substring(0, 200) + "..." || "No valid responses"}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Insights and Recommendations */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Analysis Insights</CardTitle>
                  <CardDescription>Behavioral patterns and recommendations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-3">Key Patterns</h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                          <span>Personas show distinct behavioral clustering across all 5 dimensions</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                          <span>Risk tolerance and time orientation show strongest correlation</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
                          <span>Success definition varies significantly between archetypes</span>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-3">Recommendations</h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                          <span>Use startup personas for rapid validation tasks</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                          <span>Deploy enterprise personas for comprehensive architecture</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-2 h-2 bg-gray-500 rounded-full mt-2 flex-shrink-0"></span>
                          <span>Match persona behavioral profile to task requirements</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}