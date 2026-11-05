export default function SolutionCard({ icon: Icon, title, text, examples, highlight, detailed = false }) {
  return (
    <article className={`solution-card${highlight ? ' solution-card--highlight' : ''}`}>
      <span className="solution-card__icon" aria-hidden="true">
        <Icon />
      </span>
      <h3>{title}</h3>
      <p>{text}</p>
      {detailed && (
        <ul>
          {examples.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      )}
    </article>
  );
}
