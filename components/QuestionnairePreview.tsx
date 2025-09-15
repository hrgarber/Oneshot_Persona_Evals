'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface Questionnaire {
  id: string;
  name: string;
  questions: string[];
}

interface QuestionnairePreviewProps {
  questionnaires: Questionnaire[];
  selectedQuestionnaire: string;
  onQuestionnaireSelect: (id: string) => void;
  disabled?: boolean;
}

export function QuestionnairePreview({
  questionnaires,
  selectedQuestionnaire,
  onQuestionnaireSelect,
  disabled = false
}: QuestionnairePreviewProps) {
  const [expandedQuestionnaire, setExpandedQuestionnaire] = useState<string | null>(null);

  const toggleExpanded = (id: string) => {
    setExpandedQuestionnaire(expandedQuestionnaire === id ? null : id);
  };

  const selectedQuestionnaireData = questionnaires.find(q => q.id === selectedQuestionnaire);

  return (
    <div className="space-y-4">
      <RadioGroup
        value={selectedQuestionnaire}
        onValueChange={onQuestionnaireSelect}
        disabled={disabled}
      >
        {questionnaires.map((questionnaire) => {
          const isSelected = selectedQuestionnaire === questionnaire.id;
          const isExpanded = expandedQuestionnaire === questionnaire.id;

          return (
            <Card
              key={questionnaire.id}
              className={`transition-all ${
                isSelected
                  ? 'ring-2 ring-blue-500 bg-blue-50'
                  : 'hover:bg-gray-50'
              } ${disabled ? 'opacity-50' : ''}`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem
                      value={questionnaire.id}
                      id={questionnaire.id}
                      disabled={disabled}
                    />
                    <div>
                      <Label
                        htmlFor={questionnaire.id}
                        className="text-base font-medium cursor-pointer"
                      >
                        {questionnaire.name}
                      </Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {questionnaire.questions?.length || 0} questions
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleExpanded(questionnaire.id)}
                    className="h-8 w-8 p-0"
                    disabled={disabled}
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-gray-700">Questions:</h4>
                    <div className="space-y-1">
                      {questionnaire.questions?.map((question, index) => (
                        <div
                          key={index}
                          className="text-sm text-gray-600 p-2 bg-gray-50 rounded border-l-2 border-gray-200"
                        >
                          {index + 1}. {question}
                        </div>
                      )) || []}
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </RadioGroup>

      {questionnaires.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No questionnaires available. Create some questionnaires first.
        </div>
      )}

      {selectedQuestionnaireData && (
        <div className="mt-4">
          <Card className="bg-green-50 border-green-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-800">
                Selected: {selectedQuestionnaireData.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <CardDescription className="text-green-700 text-sm">
                Ready to test {selectedQuestionnaireData.questions?.length || 0} questions across selected personas
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}