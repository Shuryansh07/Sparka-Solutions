import SectionHeading from '@/shared/components/SectionHeading';
import PathCards from '../discovery/components/PathCards';
import Breadth from './components/Breadth';
import Callout from './components/Callout';
import Experience from './components/Experience';
import FleetScale from './components/FleetScale';
import Hero from './components/Hero';
import ProcessStrip from './components/ProcessStrip';
import SolutionsPreview from './components/SolutionsPreview';

export default function HomePage() {
  return (
    <>
      <Hero />
      <ProcessStrip />
      <section aria-labelledby="paths-title" className="py-20 md:py-28">
        <div className="container-page">
          {/* One heading that flows across the full width; the intro keeps a readable measure. */}
          <SectionHeading
            id="paths-title"
            className="max-w-none [&>p]:max-w-2xl"
            title="However you like to begin, we’re ready. 3 Options to Move Forward"
            intro="Answer a few quick questions, describe it in your own words, or simply talk to a person."
          />
          <PathCards />
        </div>
      </section>
      <Breadth />
      <FleetScale />
      <SolutionsPreview />
      <Experience />
      <Callout />
    </>
  );
}
