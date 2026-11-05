import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import PageHero from '@/shared/components/PageHero';

export default function NotFoundPage() {
  return (
    <PageHero
      kicker="Error 404"
      title="We couldn’t find that page."
      intro="It may have moved, or the link may be mistyped. Go back home or start a Discovery."
      className="min-h-[70vh]"
    >
      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild variant="spark" size="lg">
          <Link to="/">Go home</Link>
        </Button>
        <Button asChild variant="outline-light" size="lg">
          <Link to="/discovery">Start Discovery</Link>
        </Button>
      </div>
    </PageHero>
  );
}
