import Notice from '@/shared/components/Notice';
import PageHero from '@/shared/components/PageHero';

export default function LegalPage({ title, sections }) {
  return (
    <>
      <PageHero kicker="Legal" title={title} />
      <section className="py-16 md:py-20">
        <div className="container-page grid max-w-3xl gap-10">
          <Notice tone="gold">
            Placeholder content. Final language must be provided and approved by Sparka’s legal counsel before launch.
          </Notice>
          {sections.map(([heading, body]) => (
            <article key={heading}>
              <h2 className="text-xl font-bold">{heading}</h2>
              <p className="mt-3 leading-relaxed text-muted-foreground">{body}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
