import { BREADTH_CHIPS } from '../../../shared/data/site';

export default function Breadth() {
  return (
    <section className="section breadth">
      <div className="container">
        <div className="section-head section-head--center">
          <span className="eyebrow eyebrow--teal">More Than Fleet Technology</span>
          <h2>If your fleet needs it, start with Sparka.</h2>
          <p>
            Equipment, parts, accessories, technology, vehicle outfitting and specialty requests - our role is to
            research and source the right fit, not limit you to a short catalog.
          </p>
        </div>
        <ul className="breadth__chips">
          {BREADTH_CHIPS.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
