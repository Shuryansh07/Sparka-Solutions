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
          <SectionHeading
            id="paths-title"
            title="However you like to begin, we’re ready."
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
