"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Play, Clock, AlertCircle } from 'lucide-react';

interface ExperimentConfig {
  model: string;
  temperature: number;
  max_tokens: number;
  provider?: string;
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
  const [model, setModel] = useState('gpt-4o-mini');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(2000);
  const [provider, setProvider] = useState('openai');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Calculate estimated runtime (personas × questions × 45s)
  const estimatedSeconds = selectedPersonas.length * questionCount * 45;
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
      provider
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
        {/* Model Selection */}
        <div className="space-y-2">
          <Label htmlFor="model">Model</Label>
          <Select value={model} onValueChange={setModel}>
            <SelectTrigger>
              <SelectValue placeholder="Select model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gpt-4o-mini">GPT-4o Mini (Recommended)</SelectItem>
              <SelectItem value="gpt-4o">GPT-4o</SelectItem>
              <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
              <SelectItem value="claude-3-haiku">Claude 3 Haiku</SelectItem>
              <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
            </SelectContent>
          </Select>
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
            <div className="space-y-2">
              <Label htmlFor="provider">Provider</Label>
              <Select value={provider} onValueChange={setProvider}>
                <SelectTrigger>
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="openai">OpenAI</SelectItem>
                  <SelectItem value="anthropic">Anthropic</SelectItem>
                </SelectContent>
              </Select>
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