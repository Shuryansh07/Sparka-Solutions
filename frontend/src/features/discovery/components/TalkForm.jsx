import { Mail, Phone, Send, Video } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Field from '../../../shared/components/Field';
import Notice from '../../../shared/components/Notice';
import { validateContact } from '../lib/flow';
import { useDiscoveryStore } from '../store/discovery.store';
import ContactFields from './ContactFields';

const METHODS = [
  { value: 'phone', label: 'Phone call', icon: Phone },
  { value: 'video', label: 'Video call', icon: Video },
  { value: 'email', label: 'Email me first', icon: Mail },
];

export default function TalkForm() {
  const navigate = useNavigate();
  const talk = useDiscoveryStore((s) => s.talk);
  const setTalk = useDiscoveryStore((s) => s.setTalk);
  const contact = useDiscoveryStore((s) => s.contact);
  const setFieldErrors = useDiscoveryStore((s) => s.setFieldErrors);
  const submit = useDiscoveryStore((s) => s.submit);
  const busy = useDiscoveryStore((s) => s.busy);
  const error = useDiscoveryStore((s) => s.error);

  const onSubmit = async (e) => {
    e.preventDefault();
    const errors = validateContact(contact);
    if (Object.keys(errors).length) return setFieldErrors(errors);
    if (await submit('talk')) navigate('/discovery/thanks');
  };

  return (
    <form className="panel talk-form" onSubmit={onSubmit} noValidate>
      <fieldset className="method-picker">
        <legend className="field__label">How would you like to talk?</legend>
        <div className="method-picker__options">
          {METHODS.map(({ value, label, icon: Icon }) => (
            <label key={value} className={`method${talk.method === value ? ' method--on' : ''}`}>
              <input
                type="radio"
                name="method"
                value={value}
                checked={talk.method === value}
                onChange={() => setTalk({ method: value })}
              />
              <Icon aria-hidden="true" />
              {label}
            </label>
          ))}
        </div>
      </fieldset>

      <ContactFields showLocation={false} showBestTime />

      <Field
        as="textarea"
        label="Anything you’d like us to know before we talk?"
        optional
        placeholder="Totally optional - we’re happy to start from scratch on the call."
        value={talk.topic}
        maxLength={2000}
        onChange={(e) => setTalk({ topic: e.target.value })}
      />

      {error && <Notice tone="error">{error}</Notice>}

      <button type="submit" className="btn btn--primary btn--block" disabled={busy}>
        {busy ? <span className="spinner" aria-hidden="true" /> : <Send />}
        Request a conversation
      </button>
      <p className="form-footnote">A Sparka representative will reach out to schedule. No sales pressure, no obligation.</p>
    </form>
  );
}
