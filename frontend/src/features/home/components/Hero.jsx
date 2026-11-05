import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Hero() {
  return (
    <section className="hero">
      <div className="container hero__inner">
        <span className="eyebrow">Your Full-Service Fleet Products &amp; Solutions Partner</span>
        <h1>
          The Right Technology.
          <br />
          <span>The Right Solution.</span>
        </h1>
        <p className="hero__promise">Complete Product Sourcing • Industry Expertise • One Trusted Partner</p>
        <p className="hero__lead">
          We start with what you need - not with what we sell. From essential fleet supplies, accessories and outfitting
          to advanced electronics and specialized equipment, we help you find the right products across manufacturers,
          backed by knowledgeable people and coordinated support.
        </p>
        <div className="hero__actions">
          <Link to="/discovery" className="btn btn--primary">
            Find Your Solution <ArrowRight />
          </Link>
          <Link to="/#how" className="btn btn--ghost-light">
            How It Works
          </Link>
        </div>
      </div>

      <figure className="hero__showcase container">
        <img
          src="/images/fleet-hero.jpg"
          alt="Commercial trucks and fleet vehicles photographed at an industrial facility at dusk"
          width="800"
          height="276"
          fetchPriority="high"
        />
      </figure>
    </section>
  );
}
