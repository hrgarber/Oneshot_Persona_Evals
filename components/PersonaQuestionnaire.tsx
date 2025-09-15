'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Question {
  id: string;
  text: string;
}

interface PersonaQuestionnaireProps {
  questions: Question[];
  onComplete: (responses: Record<string, string>) => void;
  onCancel: () => void;
}

export function PersonaQuestionnaire({ questions, onComplete, onCancel }: PersonaQuestionnaireProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>({});

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onComplete(responses);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleResponseChange = (value: string) => {
    setResponses({
      ...responses,
      [currentQuestion.id]: value,
    });
  };

  const currentResponse = responses[currentQuestion.id] || '';
  const canGoNext = currentResponse.trim().length > 0;

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center mb-4">
          <CardTitle>Persona Questionnaire</CardTitle>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        </div>
        <CardDescription>
          Question {currentIndex + 1} of {questions.length}
        </CardDescription>
        <Progress value={progress} className="mt-2" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-base font-medium">{currentQuestion.text}</Label>
          <Textarea
            value={currentResponse}
            onChange={(e) => handleResponseChange(e.target.value)}
            placeholder="Type your response here..."
            className="mt-2 min-h-[150px]"
            autoFocus
          />
        </div>

        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>

          <span className="text-sm text-muted-foreground self-center">
            {Object.keys(responses).length} of {questions.length} answered
          </span>

          <Button
            onClick={handleNext}
            disabled={!canGoNext}
          >
            {currentIndex === questions.length - 1 ? 'Complete' : 'Next'}
            {currentIndex < questions.length - 1 && <ChevronRight className="ml-2 h-4 w-4" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}