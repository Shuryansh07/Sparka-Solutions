import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Notice from '@/shared/components/Notice';
import { ROUTES } from '../lib/flow';
import { useDiscoveryStore } from '../store/discovery.store';

export default function ResumePage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const resumeDraft = useDiscoveryStore((s) => s.resumeDraft);
  const [error, setError] = useState('');

  useEffect(() => {
    resumeDraft(token)
      .then((route) => navigate(ROUTES[route]?.path || '/discovery', { replace: true }))
      .catch((err) => setError(err.message));
  }, [token, resumeDraft, navigate]);

  return (
    <section className="min-h-[60vh] bg-steel py-16 md:py-24">
      <div className="container-page max-w-2xl">
        {error ? (
          <Card className="gap-5 p-7 md:p-10">
            <h1 className="type-wide text-2xl font-bold">We couldn’t open that saved Discovery</h1>
            <Notice tone="error">{error}</Notice>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link to="/discovery">Start a new Discovery</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/discovery/talk">Talk to a person</Link>
              </Button>
            </div>
          </Card>
        ) : (
          <Card className="flex-row items-center gap-3 p-8 text-muted-foreground" aria-busy="true">
            <Loader2 className="size-5 animate-spin text-primary" /> Restoring your progress…
          </Card>
        )}
      </div>
    </section>
  );
}
