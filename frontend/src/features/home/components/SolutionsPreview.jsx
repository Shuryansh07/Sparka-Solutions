import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import SolutionCard from '../../solutions/components/SolutionCard';
import { SOLUTION_CATEGORIES } from '../../solutions/solutions.data';
import '../../solutions/solutions.css';

export default function SolutionsPreview() {
  return (
    <section className="section" id="solutions">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow eyebrow--teal">Broad Product Sourcing</span>
          <h2>Everything your fleet needs. One place to start.</h2>
          <p>
            From a single replacement accessory to a complex, multi-vehicle project, Sparka helps you navigate a broad
            marketplace of commercial fleet products. These are examples - not the limits of what we can source.
          </p>
        </div>
        <div className="solution-grid">
          {SOLUTION_CATEGORIES.map((c) => (
            <SolutionCard key={c.title} {...c} />
          ))}
        </div>
        <div className="center-row">
          <Link to="/solutions" className="btn btn--ghost">
            Explore our approach <ArrowRight />
          </Link>
        </div>
      </div>
    </section>
  );
}
