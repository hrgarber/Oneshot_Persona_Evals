'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { QuestionSelectionGrid } from './QuestionSelectionGrid';

interface Question {
  id: string;
  question: string;
  text: string;
  category?: string;
}

interface Questionnaire {
  id: string;
  name: string;
  description?: string;
  questions: string[]; // Array of question IDs
  createdAt?: string;
  created_at?: string;
  updated_at?: string;
}

export function QuestionnaireManager() {
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<Questionnaire | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form for creating/editing questionnaires
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    selectedQuestions: [] as string[], // Question IDs
  });

  useEffect(() => {
    fetchQuestionnaires();
    fetchQuestions();
  }, []);

  const fetchQuestionnaires = async () => {
    try {
      const res = await fetch('/api/questionnaires');
      const data = await res.json();
      setQuestionnaires(data);
    } catch (error) {
      console.error('Failed to fetch questionnaires:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestions = async () => {
    try {
      const res = await fetch('/api/questions');
      const data = await res.json();
      setQuestions(data);
    } catch (error) {
      console.error('Failed to fetch questions:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const endpoint = isEditing && selectedQuestionnaire
      ? `/api/questionnaires/${selectedQuestionnaire.id}`
      : '/api/questionnaires';

    try {
      const res = await fetch(endpoint, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          questions: formData.selectedQuestions,
        }),
      });

      if (res.ok) {
        fetchQuestionnaires();
        resetForm();
      }
    } catch (error) {
      console.error('Failed to save questionnaire:', error);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', selectedQuestions: [] });
    setSelectedQuestionnaire(null);
    setIsEditing(false);
  };

  const handleEdit = (questionnaire: Questionnaire) => {
    setSelectedQuestionnaire(questionnaire);
    setFormData({
      name: questionnaire.name,
      description: questionnaire.description || '',
      selectedQuestions: questionnaire.questions,
    });
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this questionnaire?')) return;

    try {
      const res = await fetch(`/api/questionnaires/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchQuestionnaires();
      }
    } catch (error) {
      console.error('Failed to delete questionnaire:', error);
    }
  };

  const toggleQuestion = (questionId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedQuestions: prev.selectedQuestions.includes(questionId)
        ? prev.selectedQuestions.filter(id => id !== questionId)
        : [...prev.selectedQuestions, questionId]
    }));
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      {/* Existing Questionnaires List */}
      <Card>
        <CardHeader>
          <CardTitle>Questionnaires</CardTitle>
          <CardDescription>Manage your questionnaires and question sets</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {questionnaires.length === 0 ? (
              <p className="text-gray-500">No questionnaires yet</p>
            ) : (
              questionnaires.map((q) => (
                <div key={q.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold">{q.name}</h3>
                      {q.description && (
                        <p className="text-sm text-gray-600 mt-1">{q.description}</p>
                      )}
                      <div className="flex gap-2 mt-2">
                        <Badge variant="secondary">
                          {q.questions.length} questions
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(q)}>
                        Edit
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDelete(q.id)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <Button className="mt-4" onClick={() => setIsEditing(true)}>
            Create New Questionnaire
          </Button>
        </CardContent>
      </Card>

      {/* Create/Edit Form */}
      {isEditing && (
        <Card>
          <CardHeader>
            <CardTitle>{selectedQuestionnaire ? 'Edit' : 'Create'} Questionnaire</CardTitle>
            <CardDescription>Select questions to include in this questionnaire</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div>
                <Label>Select Questions</Label>
                <div className="mt-2">
                  <QuestionSelectionGrid
                    questions={questions}
                    selectedQuestions={formData.selectedQuestions}
                    onQuestionToggle={toggleQuestion}
                    disabled={false}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit">
                  {selectedQuestionnaire ? 'Update' : 'Create'} Questionnaire
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

    </div>
  );
}