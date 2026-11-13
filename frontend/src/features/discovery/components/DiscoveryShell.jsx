import { Headset, Lock, ShieldCheck } from 'lucide-react';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import PageHero from '@/shared/components/PageHero';
import { useDiscoveryStore } from '../store/discovery.store';
import PathSwitcher from './PathSwitcher';

export default function DiscoveryShell({ route, title, intro, children }) {
  const clearError = useDiscoveryStore((s) => s.clearError);
  const setFieldErrors = useDiscoveryStore((s) => s.setFieldErrors);

  useEffect(() => {
    clearError();
    setFieldErrors({});
  }, [route, clearError, setFieldErrors]);

  return (
    <>
      <PageHero kicker="Sparka Discovery" title={title} intro={intro}>
        <PathSwitcher />
      </PageHero>

      <section className="bg-steel py-10 md:py-16">
        <div className="container-page grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-8">
          <div className="min-w-0">{children}</div>

          <aside aria-label="Help" className="grid gap-4 lg:sticky lg:top-24">
            {route !== 'talk' && (
              <div className="relative isolate overflow-hidden rounded-2xl bg-night p-6 text-white">
                <div aria-hidden="true" className="absolute -top-16 -right-16 -z-10 size-40 rounded-full bg-spark/20 blur-3xl" />
                <Headset className="size-6 text-spark" aria-hidden="true" />
                <h3 className="mt-3 text-lg font-bold">Prefer a person?</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-white/65">
                  Switch to a conversation at any point. Nothing you’ve shared is lost.
                </p>
                <Button asChild variant="spark" size="sm" className="mt-4 w-full">
                  <Link to="/discovery/talk">Talk to a person</Link>
                </Button>
              </div>
            )}

            <ul className="grid gap-3 px-1 text-[13px] leading-relaxed text-muted-foreground">
              <li className="flex gap-2.5">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                No proposal is sent until a representative has spoken with you.
              </li>
              <li className="flex gap-2.5">
                <Lock className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                <span>
                  We only use what you share to help with your request.{' '}
                  <Link to="/privacy" className="font-medium text-primary underline-offset-4 hover:underline">
                    Privacy
                  </Link>
                </span>
              </li>
            </ul>
          </aside>
        </div>
      </section>
    </>
  );
}
