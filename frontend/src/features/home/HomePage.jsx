import PathCards from '../discovery/components/PathCards';
import Breadth from './components/Breadth';
import Callout from './components/Callout';
import Experience from './components/Experience';
import FleetScale from './components/FleetScale';
import Hero from './components/Hero';
import ProcessStrip from './components/ProcessStrip';
import SolutionsPreview from './components/SolutionsPreview';
import './home.css';

export default function HomePage() {
  return (
    <>
      <Hero />
      <ProcessStrip />
      <section className="section home-paths" aria-labelledby="paths-title">
        <div className="container">
          <div className="section-head section-head--center">
            <span className="eyebrow eyebrow--teal">Start Your Way</span>
            <h2 id="paths-title">However you like to begin, we’re ready.</h2>
            <p>Answer a few quick questions, describe it in your own words, or simply talk to a person.</p>
          </div>
          <PathCards />
        </div>
      </section>
      <FleetScale />
      <Breadth />
      <SolutionsPreview />
      <Experience />
      <Callout />
    </>
  );
}
