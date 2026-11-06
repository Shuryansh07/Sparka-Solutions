import { Link } from 'react-router-dom';
import { TAGLINE } from '../data/site';
import Brand from './Brand';

const COLUMNS = [
  {
    title: 'Explore',
    links: [
      ['/solutions', 'Solutions'],
      ['/#how', 'How it works'],
      ['/#about', 'About'],
    ],
  },
  {
    title: 'Get started',
    links: [
      ['/discovery/guide', 'Guide Me'],
      ['/discovery/describe', 'Tell us what you need'],
      ['/discovery/talk', 'Let’s Talk'],
    ],
  },
  {
    title: 'Company',
    links: [
      ['/contact', 'Contact'],
      ['/privacy', 'Privacy'],
      ['/terms', 'Terms'],
    ],
  },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-night text-sm text-white/60">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-spark/60 to-transparent" />

      <div className="container-page grid gap-12 pt-16 pb-12 md:grid-cols-[1.5fr_repeat(3,minmax(0,1fr))] md:pt-20">
        <div className="max-w-sm">
          <Brand />
          <p className="mt-5 font-display text-[15px] font-semibold text-white">{TAGLINE}</p>
          <p className="mt-2 leading-relaxed">
            Manufacturer-independent fleet products, technology and sourcing, backed by people who listen first.
          </p>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h2 className="mb-4 font-sans text-[13px] font-semibold text-white">{col.title}</h2>
            <ul className="grid gap-2.5">
              {col.links.map(([to, label]) => (
                <li key={to}>
                  <Link to={to} className="text-white/60 no-underline transition-colors hover:text-spark">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="container-page flex flex-wrap justify-between gap-3 border-t border-white/10 py-6 text-[13px] text-white/55">
        <span>© {new Date().getFullYear()} Sparka Solutions. All rights reserved.</span>
        <span>Sparka Fleet is a division of Sparka Solutions</span>
      </div>

      {/* Decorative watermark, drawn with CSS content so it isn't treated as readable text */}
      <div
        aria-hidden="true"
        className="type-wide pointer-events-none -mb-[0.22em] text-center text-[clamp(72px,19vw,260px)] leading-none font-black tracking-tight text-white/[0.035] select-none before:content-['SPARKA']"
      />
    </footer>
  );
}
