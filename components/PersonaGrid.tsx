'use client';

import { PersonaCard } from './PersonaCard';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Users, Zap, FlaskConical, Building, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PersonaGridProps {
  personas: Array<{
    id: string;
    name: string;
    description: string;
    behavioral_profile: string;
  }>;
  selectedPersonas: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  disabled?: boolean;
}

// HACK: Hardcoded combinations for validation - would need configurable presets in production
const RECOMMENDED_COMBINATIONS = [
  {
    id: 'all',
    name: 'All Personas',
    description: 'Select all 6 personas',
    icon: Users,
    personas: ['startup_cto', 'phd_student', 'consulting_analyst', 'ml_engineer', 'data_scientist', 'product_engineer']
  },
  {
    id: 'time_pressure',
    name: 'Time Pressure Roles',
    description: 'High-urgency decision makers',
    icon: Zap,
    personas: ['startup_cto', 'consulting_analyst']
  },
  {
    id: 'research_focused',
    name: 'Research Focused',
    description: 'Academic and analytical roles',
    icon: FlaskConical,
    personas: ['phd_student', 'data_scientist']
  },
  {
    id: 'engineering_roles',
    name: 'Engineering Roles',
    description: 'Technical implementation focused',
    icon: Building,
    personas: ['ml_engineer', 'product_engineer']
  },
  {
    id: 'client_facing',
    name: 'Client-Facing',
    description: 'External stakeholder focused',
    icon: Briefcase,
    personas: ['consulting_analyst', 'product_engineer']
  }
];

export function PersonaGrid({ personas, selectedPersonas, onSelectionChange, disabled = false }: PersonaGridProps) {
  const totalPersonas = personas.length;
  const selectedCount = selectedPersonas.length;
  const selectionProgress = totalPersonas > 0 ? (selectedCount / totalPersonas) * 100 : 0;

  const handlePersonaSelect = (personaId: string) => {
    const newSelection = selectedPersonas.includes(personaId)
      ? selectedPersonas.filter(id => id !== personaId)
      : [...selectedPersonas, personaId];

    onSelectionChange(newSelection);
  };

  const handleSelectAll = () => {
    const allIds = personas.map(p => p.id);
    onSelectionChange(allIds);
  };

  const handleClearAll = () => {
    onSelectionChange([]);
  };

  const handleRecommendedSelection = (combination: typeof RECOMMENDED_COMBINATIONS[0]) => {
    // Filter to only include personas that actually exist
    const validPersonas = combination.personas.filter(id =>
      personas.some(p => p.id === id)
    );
    onSelectionChange(validPersonas);
  };

  return (
    <div className="space-y-6">
      {/* Selection Controls Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-muted/50 rounded-lg">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">
              {selectedCount} of {totalPersonas} selected
            </span>
            <Progress value={selectionProgress} className="w-24 h-2" />
          </div>
          <p className="text-xs text-muted-foreground">
            Select personas to compare their approaches to the same problem
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Actions */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleSelectAll}
            disabled={disabled || selectedCount === totalPersonas}
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

          {/* Recommended Combinations Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="text-xs">
                <Users className="w-3 h-3 mr-1" />
                Recommended
                <ChevronDown className="w-3 h-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              {RECOMMENDED_COMBINATIONS.map((combination) => {
                const Icon = combination.icon;
                const isSelected = combination.personas.every(id =>
                  selectedPersonas.includes(id)
                ) && combination.personas.length === selectedCount;

                return (
                  <DropdownMenuItem
                    key={combination.id}
                    onClick={() => handleRecommendedSelection(combination)}
                    className={cn(
                      "flex items-start gap-3 p-3 cursor-pointer",
                      isSelected && "bg-muted"
                    )}
                  >
                    <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <div className="space-y-1">
                      <div className="text-sm font-medium">{combination.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {combination.description}
                      </div>
                    </div>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Responsive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {personas.map((persona) => (
          <div
            key={persona.id}
            className="transition-transform duration-200 hover:scale-105"
          >
            <PersonaCard
              persona={persona}
              selected={selectedPersonas.includes(persona.id)}
              onSelect={handlePersonaSelect}
              disabled={disabled}
            />
          </div>
        ))}
      </div>

      {/* Selection Summary */}
      {selectedCount > 0 && (
        <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            Ready to compare {selectedCount} persona{selectedCount !== 1 ? 's' : ''}: {' '}
            <span className="font-medium">
              {selectedPersonas
                .map(id => personas.find(p => p.id === id)?.name)
                .filter(Boolean)
                .join(', ')}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}