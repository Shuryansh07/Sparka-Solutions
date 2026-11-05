import { Compass, PenLine } from 'lucide-react';
import { Link } from 'react-router-dom';
import TalkForm from '../discovery/components/TalkForm';
import './contact.css';

export default function ContactPage() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">Contact &amp; Consultation</span>
          <h1>
            Talk with a <span>real person.</span>
          </h1>
          <p>
            No mandatory forms, no scripted sales pitch. Tell us how to reach you and a Sparka representative will set
            up a phone or video consultation.
          </p>
        </div>
      </section>

      <section className="section contact">
        <div className="container contact__grid">
          <TalkForm />

          <aside className="contact__aside">
            <h2>Prefer to share details first?</h2>
            <p>Some people like to give us a head start. Both options take just a few minutes.</p>
            <Link to="/discovery/guide" className="contact__option">
              <Compass aria-hidden="true" />
              <span>
                <strong>Guide Me</strong>
                <small>A few quick, adaptive questions</small>
              </span>
            </Link>
            <Link to="/discovery/describe" className="contact__option">
              <PenLine aria-hidden="true" />
              <span>
                <strong>I’ll Tell You What I Need</strong>
                <small>Describe it in your own words</small>
              </span>
            </Link>

            <div className="contact__promise">
              <h3>What to expect</h3>
              <ul>
                <li>A personal follow-up from a Sparka representative</li>
                <li>A conversation about your needs before any estimate or proposal</li>
                <li>Manufacturer-independent recommendations</li>
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
