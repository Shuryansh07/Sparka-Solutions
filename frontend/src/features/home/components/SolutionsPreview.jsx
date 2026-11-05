import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import SectionHeading from '@/shared/components/SectionHeading';
import SolutionGrid from '../../solutions/components/SolutionGrid';

export default function SolutionsPreview() {
  return (
    <section id="solutions" className="py-20 md:py-28">
      <div className="container-page">
        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-2">
          <SectionHeading
            title="Everything your fleet needs. One place to start."
            intro="From a single replacement accessory to a complex, multi-vehicle project. These are examples, not the limits of what we can source."
          />
          <Button asChild variant="outline" className="group mb-10 md:mb-14">
            <Link to="/solutions">
              Explore our approach
              <ArrowRight className="transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
        <SolutionGrid />
      </div>
    </section>
  );
}
