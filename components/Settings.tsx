'use client';

import { useState, useEffect } from 'react';

interface LLMStatus {
  primary: string;
  ollama: { available: boolean; model: string };
  openai: { available: boolean; model: string };
}
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
// Icon components - inline SVGs for MVP
const SettingsIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const Key = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
  </svg>
);

const Check = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const X = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export function Settings() {
  const [apiKey, setApiKey] = useState('');
  const [apiConfigured, setApiConfigured] = useState(false);
  const [status, setStatus] = useState('');
  const [open, setOpen] = useState(false);
  const [llmStatus, setLlmStatus] = useState<LLMStatus | null>(null);

  useEffect(() => {
    checkApiKey();
    checkLLMStatus();
  }, []);

  const checkApiKey = async () => {
    try {
      const res = await fetch('/api/config/openai');
      const data = await res.json();
      setApiConfigured(data.configured);
      if (data.configured) {
        setApiKey(data.key);
      }
    } catch (error) {
      console.error('Failed to check API key:', error);
    }
  };

  const checkLLMStatus = async () => {
    try {
      const res = await fetch('/api/llm/status');
      const data = await res.json();
      setLlmStatus(data);
    } catch (error) {
      console.error('Failed to check LLM status:', error);
    }
  };

  const updateApiKey = async () => {
    try {
      const res = await fetch('/api/config/openai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: apiKey })
      });

      if (res.ok) {
        const data = await res.json();
        setApiConfigured(true);
        setStatus(data.message || 'API key configured successfully');
        setTimeout(() => setStatus(''), data.temporary ? 8000 : 3000);
        // Recheck LLM status after updating API key
        checkLLMStatus();
      } else {
        const errorData = await res.json();
        setStatus(errorData.error || 'Failed to configure API key');
      }
    } catch {
      setStatus('Error configuring API key');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="fixed top-6 right-6">
          <SettingsIcon className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Configure your experiment environment
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* LLM Provider Status Card */}
          <Card>
            <CardHeader>
              <CardTitle>LLM Provider Status</CardTitle>
              <CardDescription>
                Active provider and availability
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {llmStatus && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Active Provider:</span>
                    <Badge variant="default" className="capitalize">
                      {llmStatus.primary}
                    </Badge>
                  </div>

                  <div className="space-y-2 border-t pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Ollama (Local):</span>
                      {llmStatus.ollama.available ? (
                        <Badge variant="outline" className="gap-1">
                          <Check className="h-3 w-3" />
                          Running
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1">
                          <X className="h-3 w-3" />
                          Not Running
                        </Badge>
                      )}
                    </div>
                    {llmStatus.ollama.available && (
                      <div className="text-xs text-gray-500 pl-4">
                        Model: {llmStatus.ollama.model}
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-sm">OpenAI (API):</span>
                      {llmStatus.openai.available ? (
                        <Badge variant="outline" className="gap-1">
                          <Check className="h-3 w-3" />
                          Configured
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1">
                          <X className="h-3 w-3" />
                          Not Configured
                        </Badge>
                      )}
                    </div>
                    {llmStatus.openai.available && (
                      <div className="text-xs text-gray-500 pl-4">
                        Model: {llmStatus.openai.model}
                      </div>
                    )}
                  </div>

                  {llmStatus.primary === 'ollama' && (
                    <div className="text-xs text-green-600 border-t pt-2">
                      ✓ Using local Ollama - No API costs
                    </div>
                  )}
                  {llmStatus.primary === 'openai' && !llmStatus.ollama.available && (
                    <div className="text-xs text-amber-600 border-t pt-2">
                      ⚠ Using OpenAI API - Costs apply
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-4 w-4" />
                OpenAI API Configuration
              </CardTitle>
              <CardDescription>
                Fallback provider when Ollama is unavailable
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Label>Status:</Label>
                {apiConfigured ? (
                  <Badge variant="outline" className="gap-1">
                    <Check className="h-3 w-3" />
                    Configured
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="gap-1">
                    <X className="h-3 w-3" />
                    Not Configured
                  </Badge>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key</Label>
                <div className="flex gap-2">
                  <Input
                    id="apiKey"
                    type="password"
                    placeholder={apiConfigured ? "sk-...****" : "sk-..."}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                  />
                  <Button onClick={updateApiKey} disabled={!apiKey.trim()}>
                    Update
                  </Button>
                </div>
              </div>

              {status && (
                <p className={`text-sm ${status.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
                  {status}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-gray-600">
              <p>Behavioral Analysis Questionnaire System v1.0</p>
              <p>This tool enables behavioral analysis of AI personas through structured questionnaires.</p>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}