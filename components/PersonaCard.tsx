import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PersonaCardProps {
  persona: {
    id: string;
    name: string;
    description: string;
    behavioral_profile: string;
  };
  selected: boolean;
  onSelect: (id: string) => void;
}

export function PersonaCard({ persona, selected, onSelect }: PersonaCardProps) {
  // HACK: Simple badge mapping for validation - would need more sophisticated parsing in production
  const getBadgesFromProfile = (profile: string) => {
    const profileLower = profile.toLowerCase();
    const badges = [];

    // Time-related badges
    if (profileLower.includes('time pressure') || profileLower.includes('deadline')) {
      badges.push({ text: '⚡ Time Pressure', variant: 'destructive' as const });
    }
    if (profileLower.includes('academic') || profileLower.includes('research')) {
      badges.push({ text: '📚 Academic', variant: 'secondary' as const });
    }
    if (profileLower.includes('client') || profileLower.includes('consulting')) {
      badges.push({ text: '💼 Client-Focused', variant: 'default' as const });
    }
    if (profileLower.includes('experiment') || profileLower.includes('prototype')) {
      badges.push({ text: '🧪 Experimental', variant: 'outline' as const });
    }
    if (profileLower.includes('business') || profileLower.includes('commercial')) {
      badges.push({ text: '📊 Business', variant: 'default' as const });
    }
    if (profileLower.includes('scale') || profileLower.includes('growth')) {
      badges.push({ text: '📈 Scale', variant: 'secondary' as const });
    }
    if (profileLower.includes('risk')) {
      badges.push({ text: '🎯 Risk-Aware', variant: 'outline' as const });
    }
    if (profileLower.includes('minimal') || profileLower.includes('lean')) {
      badges.push({ text: '⚡ Minimal', variant: 'secondary' as const });
    }

    return badges;
  };

  const badges = getBadgesFromProfile(persona.behavioral_profile);

  // Truncate description for preview - TODO: would need configurable length in production
  const truncatedDescription = persona.description.length > 120
    ? persona.description.substring(0, 120) + '...'
    : persona.description;

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-md",
        selected && "ring-2 ring-green-500 border-green-500 shadow-lg"
      )}
      onClick={() => onSelect(persona.id)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-semibold text-lg leading-tight">
            {persona.name}
          </h3>
          {selected && (
            <div className="flex-shrink-0 ml-2">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          {badges.map((badge, index) => (
            <Badge key={index} variant={badge.variant} className="text-xs">
              {badge.text}
            </Badge>
          ))}
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed">
          {truncatedDescription}
        </p>
      </CardContent>
    </Card>
  );
}