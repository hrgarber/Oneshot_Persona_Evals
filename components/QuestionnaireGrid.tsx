'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useState, useEffect } from 'react';

interface Question {
  id: string;
  text: string;
  question: string;
}

interface Questionnaire {
  id: string;
  name: string;
  questions: string[];
}

interface QuestionnaireGridProps {
  questionnaires: Questionnaire[];
  selectedQuestionnaire: string;
  onQuestionnaireSelect: (id: string) => void;
  disabled?: boolean;
}

export function QuestionnaireGrid({
  questionnaires,
  selectedQuestionnaire,
  onQuestionnaireSelect,
  disabled = false
}: QuestionnaireGridProps) {
  const [previewQuestionnaire, setPreviewQuestionnaire] = useState<Questionnaire | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch('/api/questions');
        const questionsData = await response.json();
        setQuestions(questionsData);
      } catch (error) {
        console.error('Failed to fetch questions:', error);
      }
    };

    fetchQuestions();
  }, []);

  const getQuestionText = (questionId: string): string => {
    const question = questions.find(q => q.id === questionId);
    return question ? question.text : questionId;
  };

  const handleCardClick = (questionnaire: Questionnaire) => {
    if (!disabled) {
      // If already selected, deselect
      if (selectedQuestionnaire === questionnaire.id) {
        onQuestionnaireSelect('');
      } else {
        onQuestionnaireSelect(questionnaire.id);
      }
    }
  };

  const handlePreviewClick = (e: React.MouseEvent, questionnaire: Questionnaire) => {
    e.stopPropagation();
    setPreviewQuestionnaire(questionnaire);
  };

  if (questionnaires.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <p className="text-gray-500 mb-2">No questionnaires available</p>
        <p className="text-sm text-gray-400">Create questionnaires in the Manage tab</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {questionnaires.map((questionnaire) => {
          const isSelected = selectedQuestionnaire === questionnaire.id;

          return (
            <Card
              key={questionnaire.id}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                isSelected
                  ? 'ring-2 ring-blue-500 bg-blue-50 border-blue-200'
                  : 'hover:border-blue-300'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => handleCardClick(questionnaire)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-1">
                      {questionnaire.name}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {questionnaire.questions?.length || 0} questions
                      </Badge>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="ml-2">
                      <Check className="h-6 w-6 text-blue-600" />
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <CardDescription className="text-sm mb-3">
                  {questionnaire.questions && questionnaire.questions.length > 0 ? (
                    <span className="line-clamp-2">
                      Preview: "{questionnaire.questions[0]}"
                    </span>
                  ) : (
                    <span className="text-gray-400">No questions added yet</span>
                  )}
                </CardDescription>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={(e) => handlePreviewClick(e, questionnaire)}
                  disabled={disabled}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View All Questions
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Selected Questionnaire Summary */}
      {selectedQuestionnaire && (
        <div className="mt-6">
          <Card className="bg-green-50 border-green-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-800">
                Selected Questionnaire
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-green-700 font-medium">
                {questionnaires.find(q => q.id === selectedQuestionnaire)?.name}
              </p>
              <p className="text-green-600 text-sm mt-1">
                {questionnaires.find(q => q.id === selectedQuestionnaire)?.questions?.length || 0} questions ready for testing
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={!!previewQuestionnaire} onOpenChange={() => setPreviewQuestionnaire(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {previewQuestionnaire?.name}
            </DialogTitle>
          </DialogHeader>

          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between mb-4">
              <Badge variant="secondary">
                {previewQuestionnaire?.questions?.length || 0} Questions
              </Badge>
              {selectedQuestionnaire === previewQuestionnaire?.id && (
                <Badge className="bg-blue-100 text-blue-700">
                  Currently Selected
                </Badge>
              )}
            </div>

            <div className="space-y-2">
              {previewQuestionnaire?.questions?.map((question, index) => (
                <div
                  key={index}
                  className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-start gap-3">
                    <span className="font-semibold text-gray-500 min-w-[24px]">
                      {index + 1}.
                    </span>
                    <span className="text-gray-700">{getQuestionText(question)}</span>
                  </div>
                </div>
              )) || (
                <p className="text-gray-500 text-center py-8">
                  No questions in this questionnaire
                </p>
              )}
            </div>

            {!disabled && previewQuestionnaire && selectedQuestionnaire !== previewQuestionnaire.id && (
              <Button
                className="w-full mt-4"
                onClick={() => {
                  onQuestionnaireSelect(previewQuestionnaire.id);
                  setPreviewQuestionnaire(null);
                }}
              >
                Select This Questionnaire
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}