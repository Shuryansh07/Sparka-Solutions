import { PROCESS_STEPS } from '../../../shared/data/site';

export default function ProcessStrip() {
  return (
    <section className="process" id="how" aria-label="How it works">
      <ol className="container process__list">
        {PROCESS_STEPS.map((s) => (
          <li key={s.num}>
            <span className="process__num">{s.num}</span>
            <div>
              <b>{s.title}</b>
              <small>{s.text}</small>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
