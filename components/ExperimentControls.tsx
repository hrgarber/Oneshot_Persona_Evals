"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// Removed broken Select component imports that caused nested select issues
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Switch } from '@/components/ui/switch';
import { ChevronDown, Play, Clock, AlertCircle, Brain } from 'lucide-react';

interface ExperimentConfig {
  model: string;
  temperature: number;
  max_tokens: number;
  enableAnalysis: boolean;
}

interface ExperimentControlsProps {
  selectedPersonas: string[];
  selectedQuestionnaire: string | null;
  questionCount: number;
  onRunExperiment: (config: ExperimentConfig) => void;
  isRunning?: boolean;
}

export default function ExperimentControls({
  selectedPersonas,
  selectedQuestionnaire,
  questionCount,
  onRunExperiment,
  isRunning = false
}: ExperimentControlsProps) {
  const [model, setModel] = useState('gpt-5-mini');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(2000);
  const [enableAnalysis, setEnableAnalysis] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Calculate estimated runtime (personas × questions × 45s)
  // Add extra time if analysis is enabled (10s per persona)
  const baseSeconds = selectedPersonas.length * questionCount * 45;
  const analysisSeconds = enableAnalysis ? selectedPersonas.length * 10 : 0;
  const estimatedSeconds = baseSeconds + analysisSeconds;
  const estimatedMinutes = Math.ceil(estimatedSeconds / 60);

  // Validation
  const hasValidSelection = selectedPersonas.length > 0 && selectedQuestionnaire;
  const canRun = hasValidSelection && !isRunning;

  const getButtonText = () => {
    if (isRunning) return "Running Experiment...";
    if (!selectedQuestionnaire) return "Select Questionnaire First";
    if (selectedPersonas.length === 0) return "Select Personas First";
    return `Run Analysis: ${selectedPersonas.length} personas • ${questionCount} questions`;
  };

  const handleRun = () => {
    if (!canRun) return;

    const config: ExperimentConfig = {
      model,
      temperature,
      max_tokens: maxTokens,
      enableAnalysis: enableAnalysis
    };

    onRunExperiment(config);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="h-5 w-5" />
          Experiment Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Analysis Toggle */}
        <div className="flex items-center justify-between p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <div className="flex items-center gap-3">
            <Brain className="h-5 w-5 text-purple-600" />
            <div>
              <Label htmlFor="enable-analysis" className="text-base font-medium cursor-pointer">
                Enable Behavioral Analysis
              </Label>
              <p className="text-sm text-gray-600 mt-1">
                Automatically analyze responses for behavioral dimensions after completion
              </p>
            </div>
          </div>
          <Switch
            id="enable-analysis"
            checked={enableAnalysis}
            onCheckedChange={setEnableAnalysis}
            disabled={isRunning}
          />
        </div>

        {/* Model Selection */}
        <div className="space-y-2">
          <Label htmlFor="model">Model</Label>
          <select
            id="model"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="flex h-10 w-full rounded-md border border-gray-300 bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="gpt-5-mini">GPT-5 mini - Faster, cheaper ($0.25/$2.00 per 1M)</option>
            <option value="gpt-5-nano">GPT-5 nano - Fastest, cheapest ($0.05/$0.40 per 1M)</option>
            <option value="gpt-5">GPT-5 - Best for coding & agentic tasks ($1.25/$10.00 per 1M)</option>
          </select>
        </div>

        {/* Advanced Settings */}
        <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-0">
              Advanced Settings
              <ChevronDown className={`h-4 w-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="temperature">Temperature</Label>
                <Input
                  id="temperature"
                  type="number"
                  min="0"
                  max="2"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxTokens">Max Tokens</Label>
                <Input
                  id="maxTokens"
                  type="number"
                  min="100"
                  max="4000"
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                />
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Runtime Estimation */}
        {hasValidSelection && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-blue-700">
              <Clock className="h-4 w-4" />
              <span className="font-medium">Estimated Runtime: {estimatedMinutes} minutes</span>
            </div>
            <p className="text-sm text-blue-600 mt-1">
              Based on {selectedPersonas.length} personas × {questionCount} questions × ~45s per response
              {enableAnalysis && ' + behavioral analysis'}
            </p>
          </div>
        )}

        {/* Validation Messages */}
        {!hasValidSelection && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-amber-700">
              <AlertCircle className="h-4 w-4" />
              <span className="font-medium">Setup Required</span>
            </div>
            <ul className="text-sm text-amber-600 mt-1 space-y-1">
              {selectedPersonas.length === 0 && <li>• Select at least one persona</li>}
              {!selectedQuestionnaire && <li>• Choose a questionnaire</li>}
            </ul>
          </div>
        )}

        {/* Run Button */}
        <Button
          onClick={handleRun}
          disabled={!canRun}
          className={`w-full h-12 text-lg font-medium ${
            canRun
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isRunning && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />}
          {getButtonText()}
        </Button>

        {/* Selection Summary */}
        {hasValidSelection && (
          <div className="text-sm text-gray-600 text-center">
            Ready to analyze {selectedPersonas.length} persona{selectedPersonas.length !== 1 ? 's' : ''}
            {' '}with {questionCount} questions using {model}
          </div>
        )}
      </CardContent>
    </Card>
  );
}