import { Badge } from '@/components/ui/badge';
import { Clock, Zap, Target, Shield, CheckCircle } from 'lucide-react';

interface BehavioralProfileBadgesProps {
  profile: string;
}

export function BehavioralProfileBadges({ profile }: BehavioralProfileBadgesProps) {
  const profileLower = profile.toLowerCase();
  const badges = [];

  // Time orientation badges
  if (profileLower.includes('extreme time pressure') || profileLower.includes('urgent')) {
    badges.push({ icon: Zap, label: 'Fast Mover', variant: 'destructive' as const });
  } else if (profileLower.includes('methodical')) {
    badges.push({ icon: Clock, label: 'Methodical', variant: 'secondary' as const });
  }

  // Risk tolerance badges
  if (profileLower.includes('high risk')) {
    badges.push({ icon: Target, label: 'Risk Taker', variant: 'default' as const });
  } else if (profileLower.includes('risk-averse')) {
    badges.push({ icon: Shield, label: 'Risk Averse', variant: 'outline' as const });
  }

  // Scope focus badges
  if (profileLower.includes('minimal')) {
    badges.push({ icon: CheckCircle, label: 'Minimalist', variant: 'secondary' as const });
  }

  // Quality approach badges
  if (profileLower.includes('pragmatic')) {
    badges.push({ label: 'Pragmatic', variant: 'outline' as const });
  } else if (profileLower.includes('quality-focused')) {
    badges.push({ label: 'Quality First', variant: 'secondary' as const });
  }

  // Additional trait badges
  if (profileLower.includes('client-focused')) {
    badges.push({ label: 'Client-Focused', variant: 'default' as const });
  }
  if (profileLower.includes('experiment')) {
    badges.push({ label: 'Experimental', variant: 'secondary' as const });
  }
  if (profileLower.includes('academic')) {
    badges.push({ label: 'Academic', variant: 'outline' as const });
  }

  return (
    <div className="flex flex-wrap gap-2">
      {badges.map((badge, index) => (
        <Badge key={index} variant={badge.variant} className="text-xs">
          {badge.icon && <badge.icon className="mr-1 h-3 w-3" />}
          {badge.label}
        </Badge>
      ))}
    </div>
  );
}