import { ArrowRight, CheckCircle2, Compass, PenLine } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageHero from '@/shared/components/PageHero';
import TalkForm from '../discovery/components/TalkForm';

const OPTIONS = [
  { to: '/discovery/guide', icon: Compass, title: 'Guide Me', text: 'A few quick, adaptive questions' },
  { to: '/discovery/describe', icon: PenLine, title: 'I’ll Tell You What I Need', text: 'Describe it in your own words' },
];

const EXPECT = [
  'A personal follow-up from a Sparka representative',
  'A conversation about your needs before any estimate or proposal',
  'Manufacturer-independent recommendations',
];

export default function ContactPage() {
  return (
    <>
      <PageHero
        kicker="Contact and consultation"
        image="/images/hero-highway.jpg"
        title="Talk with a real person."
        intro="No mandatory forms, no scripted sales pitch. Tell us how to reach you and a Sparka representative will set up a phone or video consultation."
      />

      <section className="bg-steel py-16 md:py-24">
        <div className="container-page grid items-start gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-12">
          <TalkForm />

          <aside className="grid gap-6 lg:sticky lg:top-24">
            <div>
              <h2 className="text-2xl font-bold">Prefer to share details first?</h2>
              <p className="mt-2 text-muted-foreground">Some people like to give us a head start. Both take a few minutes.</p>
            </div>
            <div className="grid gap-3">
              {OPTIONS.map(({ to, icon: Icon, title, text }) => (
                <Link
                  key={to}
                  to={to}
                  className="group flex items-center gap-4 rounded-2xl border bg-background p-4 text-foreground no-underline transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_16px_40px_-24px_rgb(7_27_32/0.4)]"
                >
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent text-primary" aria-hidden="true">
                    <Icon className="size-5" />
                  </span>
                  <span className="grid flex-1">
                    <strong className="font-semibold">{title}</strong>
                    <small className="text-sm text-muted-foreground">{text}</small>
                  </span>
                  <ArrowRight className="size-4 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-primary" aria-hidden="true" />
                </Link>
              ))}
            </div>

            <div className="rounded-2xl bg-night p-6 text-white">
              <h3 className="text-lg font-bold">What to expect</h3>
              <ul className="mt-4 grid gap-3 text-[15px] text-white/75">
                {EXPECT.map((e) => (
                  <li key={e} className="flex gap-3">
                    <CheckCircle2 className="mt-0.5 size-[18px] shrink-0 text-spark" aria-hidden="true" />
                    {e}
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
