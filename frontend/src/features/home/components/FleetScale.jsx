const CARDS = [
  {
    img: '/images/fleet-hero.jpg',
    alt: 'Commercial vehicles illustrating support for operations at scale',
    kicker: 'Large & National Fleets',
    title: 'Support for operations at scale',
    text: 'Broad sourcing, multi-vehicle projects and coordinated solutions across locations.',
  },
  {
    img: '/images/fleet-small.jpg',
    alt: 'Commercial vehicles illustrating personal attention for every vehicle',
    kicker: 'Small & Growing Fleets',
    title: 'Personal attention for every vehicle',
    text: 'Practical solutions for local businesses, owner-operators and growing teams.',
  },
];

export default function FleetScale() {
  return (
    <section className="section fleet-scale" id="fleets">
      <div className="container">
        <div className="section-head section-head--center">
          <span className="eyebrow eyebrow--teal">Built Around Your Operation</span>
          <h2>Every Fleet. Every Size. Every Need.</h2>
          <p>
            Whether you operate a handful of vehicles or manage thousands, Sparka helps you find the right products,
            equipment and technology for your operation.
          </p>
        </div>
        <div className="scale-grid">
          {CARDS.map((c) => (
            <article key={c.title} className="scale-card">
              <img src={c.img} alt={c.alt} loading="lazy" width="700" height="400" />
              <div className="scale-card__copy">
                <span>{c.kicker}</span>
                <h3>{c.title}</h3>
                <p>{c.text}</p>
              </div>
            </article>
          ))}
        </div>
        <p className="scale-promise">We start with what you need - not with what we sell.</p>
      </div>
    </section>
  );
}
