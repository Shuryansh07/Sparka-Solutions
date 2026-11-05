import Notice from '../../shared/components/Notice';
import './legal.css';

export default function LegalPage({ title, sections }) {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">Legal</span>
          <h1>{title}</h1>
        </div>
      </section>
      <section className="section">
        <div className="container legal">
          <Notice tone="gold">
            Placeholder content. Final language must be provided and approved by Sparka’s legal counsel before launch.
          </Notice>
          {sections.map(([heading, body]) => (
            <article key={heading}>
              <h2>{heading}</h2>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
