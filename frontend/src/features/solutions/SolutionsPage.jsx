import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import PathCards from '../discovery/components/PathCards';
import SolutionCard from './components/SolutionCard';
import { SOLUTION_CATEGORIES } from './solutions.data';
import './solutions.css';

const APPROACH = [
  { title: 'Listen first', text: 'We start with your operation, goals and constraints - not with a product to sell.' },
  { title: 'Research options', text: 'We compare suitable products across manufacturers and verify fit and availability.' },
  { title: 'Recommend with people', text: 'A representative reviews findings with you before any estimate or proposal.' },
  { title: 'Source & support', text: 'We coordinate sourcing, delivery, installation through qualified providers, and follow-up.' },
];

export default function SolutionsPage() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">Solutions & Approach</span>
          <h1>
            Everything your fleet needs. <span>One place to start.</span>
          </h1>
          <p>
            Sparka is manufacturer-independent. We research and source across a broad marketplace of commercial fleet
            products - these categories are examples, not the limits of what we can find.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow eyebrow--teal">Our Approach</span>
            <h2>A human-first process, from first question to follow-up.</h2>
          </div>
          <ol className="approach">
            {APPROACH.map((a) => (
              <li key={a.title}>
                <h3>{a.title}</h3>
                <p>{a.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section solutions-bg">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow eyebrow--teal">Broad Product Sourcing</span>
            <h2>What we help fleets source</h2>
            <p>From a single replacement accessory to a complex, multi-vehicle project.</p>
          </div>
          <div className="solution-grid">
            {SOLUTION_CATEGORIES.map((c) => (
              <SolutionCard key={c.title} {...c} detailed />
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head section-head--center">
            <span className="eyebrow eyebrow--teal">Start Your Way</span>
            <h2>Three ways to begin. All equally welcome.</h2>
          </div>
          <PathCards />
          <div className="center-row">
            <Link to="/contact" className="btn btn--text">
              Or contact us directly <ArrowRight />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
