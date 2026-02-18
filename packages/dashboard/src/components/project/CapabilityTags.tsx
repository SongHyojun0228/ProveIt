import { Badge } from '@/components/shared/Badge';

interface Capability {
  name: string;
  category: string;
  proficiency: string;
  evidence: string;
}

const proficiencyColor: Record<string, string> = {
  beginner: 'gray',
  intermediate: 'blue',
  advanced: 'purple',
  expert: 'green',
};

export function CapabilityTags({ capabilities }: { capabilities: Capability[] }) {
  if (!capabilities || capabilities.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {capabilities.map((cap) => (
        <span key={cap.name} title={cap.evidence}>
          <Badge color={proficiencyColor[cap.proficiency] || 'gray'}>
            {cap.name}
          </Badge>
        </span>
      ))}
    </div>
  );
}
