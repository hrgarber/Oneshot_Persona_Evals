'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Check, Search, ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Question {
  id: string;
  question: string;
  text: string;
  category?: string;
}

interface QuestionSelectionGridProps {
  questions: Question[];
  selectedQuestions: string[];
  onQuestionToggle: (questionId: string) => void;
  disabled?: boolean;
}

// HACK: Extract categories from question IDs for validation - would need proper categorization in production
const getCategoryFromId = (id: string): string => {
  if (id.includes('requirements')) return 'Requirements';
  if (id.includes('time') || id.includes('estimate')) return 'Time Management';
  if (id.includes('quality') || id.includes('tradeoff')) return 'Quality & Trade-offs';
  if (id.includes('success') || id.includes('definition')) return 'Success Criteria';
  if (id.includes('approach') || id.includes('system')) return 'Technical Approach';
  if (id.includes('risk') || id.includes('tolerance')) return 'Risk Management';
  if (id.includes('scope') || id.includes('boundaries')) return 'Scope Definition';
  return 'General';
};

const getQuestionPreview = (text: string): string => {
  // HACK: Simple truncation for validation - would need smarter text processing in production
  return text.length > 80 ? text.substring(0, 80) + '...' : text;
};

const getCategoryColor = (category: string): string => {
  // HACK: Hardcoded color mapping for validation
  const colors: Record<string, string> = {
    'Requirements': 'bg-blue-100 text-blue-800 border-blue-200',
    'Time Management': 'bg-orange-100 text-orange-800 border-orange-200',
    'Quality & Trade-offs': 'bg-purple-100 text-purple-800 border-purple-200',
    'Success Criteria': 'bg-green-100 text-green-800 border-green-200',
    'Technical Approach': 'bg-indigo-100 text-indigo-800 border-indigo-200',
    'Risk Management': 'bg-red-100 text-red-800 border-red-200',
    'Scope Definition': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'General': 'bg-gray-100 text-gray-800 border-gray-200'
  };
  return colors[category] || colors['General'];
};

function QuestionCard({
  question,
  selected,
  onToggle,
  disabled
}: {
  question: Question;
  selected: boolean;
  onToggle: () => void;
  disabled?: boolean;
}) {
  const category = question.category || getCategoryFromId(question.id);
  const preview = getQuestionPreview(question.text);
  const categoryColorClass = getCategoryColor(category);

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-md",
        selected && "ring-2 ring-green-500 border-green-500 shadow-lg",
        disabled && "opacity-50 cursor-not-allowed"
      )}
      onClick={disabled ? undefined : onToggle}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 mr-2">
            <div className={cn(
              "inline-block px-2 py-1 rounded-md text-xs font-medium mb-2 border",
              categoryColorClass
            )}>
              {category}
            </div>
            <h4 className="font-medium text-sm leading-tight">
              {preview}
            </h4>
          </div>
          {selected && (
            <div className="flex-shrink-0">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </div>
            </div>
          )}
        </div>

        <div className="text-xs text-muted-foreground">
          ID: {question.id}
        </div>
      </CardContent>
    </Card>
  );
}

export function QuestionSelectionGrid({
  questions,
  selectedQuestions,
  onQuestionToggle,
  disabled = false
}: QuestionSelectionGridProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set());

  // Group questions by category
  const categorizedQuestions = useMemo(() => {
    const groups: Record<string, Question[]> = {};

    questions.forEach(question => {
      const category = question.category || getCategoryFromId(question.id);
      if (!groups[category]) groups[category] = [];
      groups[category].push(question);
    });

    return groups;
  }, [questions]);

  // Filter questions based on search
  const filteredQuestions = useMemo(() => {
    if (!searchTerm.trim()) return categorizedQuestions;

    const filtered: Record<string, Question[]> = {};
    const lowerSearch = searchTerm.toLowerCase();

    Object.entries(categorizedQuestions).forEach(([category, categoryQuestions]) => {
      const matchingQuestions = categoryQuestions.filter(q =>
        q.text.toLowerCase().includes(lowerSearch) ||
        q.id.toLowerCase().includes(lowerSearch) ||
        category.toLowerCase().includes(lowerSearch)
      );

      if (matchingQuestions.length > 0) {
        filtered[category] = matchingQuestions;
      }
    });

    return filtered;
  }, [categorizedQuestions, searchTerm]);

  const totalQuestions = questions.length;
  const selectedCount = selectedQuestions.length;
  const selectionProgress = totalQuestions > 0 ? (selectedCount / totalQuestions) * 100 : 0;

  const handleSelectAll = () => {
    const allIds = questions.map(q => q.id);
    allIds.forEach(id => {
      if (!selectedQuestions.includes(id)) {
        onQuestionToggle(id);
      }
    });
  };

  const handleClearAll = () => {
    selectedQuestions.forEach(id => {
      onQuestionToggle(id);
    });
  };

  const toggleCategory = (category: string) => {
    const newOpen = new Set(openCategories);
    if (newOpen.has(category)) {
      newOpen.delete(category);
    } else {
      newOpen.add(category);
    }
    setOpenCategories(newOpen);
  };

  // Auto-open categories when searching
  const shouldAutoOpen = searchTerm.trim().length > 0;

  return (
    <div className="space-y-4">
      {/* Selection Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-muted/50 rounded-lg">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">
              {selectedCount} of {totalQuestions} selected
            </span>
            <Progress value={selectionProgress} className="w-24 h-2" />
          </div>
          <p className="text-xs text-muted-foreground">
            Select questions to include in your questionnaire
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSelectAll}
            disabled={disabled || selectedCount === totalQuestions}
            className="text-xs"
          >
            Select All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearAll}
            disabled={disabled || selectedCount === 0}
            className="text-xs"
          >
            Clear All
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search questions by content, ID, or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
          disabled={disabled}
        />
      </div>

      {/* Categories */}
      <div className="space-y-3">
        {Object.entries(filteredQuestions).map(([category, categoryQuestions]) => {
          const isOpen = shouldAutoOpen || openCategories.has(category);
          const selectedInCategory = categoryQuestions.filter(q =>
            selectedQuestions.includes(q.id)
          ).length;

          return (
            <div key={category}>
              <Button
                variant="ghost"
                className="w-full justify-between p-3 h-auto border rounded-lg hover:bg-muted/50"
                onClick={() => !shouldAutoOpen && toggleCategory(category)}
                disabled={disabled || shouldAutoOpen}
              >
                <div className="flex items-center gap-3">
                  {!shouldAutoOpen && (
                    isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
                  )}
                  <span className="font-medium">{category}</span>
                  <Badge variant="secondary" className="text-xs">
                    {categoryQuestions.length} questions
                  </Badge>
                  {selectedInCategory > 0 && (
                    <Badge variant="default" className="text-xs">
                      {selectedInCategory} selected
                    </Badge>
                  )}
                </div>
              </Button>

              {isOpen && (
                <div className="mt-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pl-4">
                  {categoryQuestions.map((question) => (
                    <div
                      key={question.id}
                      className="transition-transform duration-200 hover:scale-[1.02]"
                    >
                      <QuestionCard
                        question={question}
                        selected={selectedQuestions.includes(question.id)}
                        onToggle={() => onQuestionToggle(question.id)}
                        disabled={disabled}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Selection Summary */}
      {selectedCount > 0 && (
        <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            <span className="font-medium">{selectedCount}</span> question{selectedCount !== 1 ? 's' : ''} selected
            {selectedCount <= 5 && (
              <span className="block mt-1 text-xs">
                {selectedQuestions
                  .slice(0, 3)
                  .map(id => questions.find(q => q.id === id)?.id)
                  .filter(Boolean)
                  .join(', ')}
                {selectedCount > 3 && ` +${selectedCount - 3} more`}
              </span>
            )}
          </p>
        </div>
      )}

      {Object.keys(filteredQuestions).length === 0 && searchTerm && (
        <div className="text-center p-8 text-muted-foreground">
          <p>No questions found matching "{searchTerm}"</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSearchTerm('')}
            className="mt-2"
          >
            Clear search
          </Button>
        </div>
      )}
    </div>
  );
}