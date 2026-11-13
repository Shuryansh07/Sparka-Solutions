import { RevealGroup } from '@/shared/components/Reveal';
import { SOLUTION_CATEGORIES } from '../solutions.data';
import SolutionCard from './SolutionCard';

export default function SolutionGrid({ detailed = false }) {
  return (
    <RevealGroup
      stagger={0.05}
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      {SOLUTION_CATEGORIES.map((c) => (
        <SolutionCard key={c.title} {...c} detailed={detailed} />
      ))}
    </RevealGroup>
  );
}
