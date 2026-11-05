import DiscoveryShell from '../components/DiscoveryShell';
import TalkForm from '../components/TalkForm';

export default function TalkPage() {
  return (
    <DiscoveryShell
      route="talk"
      title="Let’s Talk"
      intro="Skip the forms. Tell us how to reach you and a Sparka representative will set up a phone or video consultation."
    >
      <TalkForm />
    </DiscoveryShell>
  );
}
