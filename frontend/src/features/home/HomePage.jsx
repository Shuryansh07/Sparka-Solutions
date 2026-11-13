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
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between md:gap-10">
            {/* Above the heading on phones, to its right from tablet up. */}
            <p className="type-wide w-fit text-2xl font-bold text-foreground md:order-last md:mt-2 md:text-3xl">
              3 Journeys
            </p>
            <SectionHeading
              id="paths-title"
              title="However you like to begin, we’re ready."
              intro="Answer a few quick questions, describe it in your own words, or simply talk to a person."
            />
          </div>
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
