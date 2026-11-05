import Field from '../../../shared/components/Field';
import { useDiscoveryStore } from '../store/discovery.store';

export default function ContactFields({ showLocation = true, showBestTime = false }) {
  const contact = useDiscoveryStore((s) => s.contact);
  const errors = useDiscoveryStore((s) => s.fieldErrors);
  const setContact = useDiscoveryStore((s) => s.setContact);
  const bind = (key) => ({ value: contact[key] || '', onChange: (e) => setContact({ [key]: e.target.value }) });

  return (
    <div className="form-grid">
      <Field label="Your name" autoComplete="name" error={errors.name} {...bind('name')} />
      <Field label="Company" optional autoComplete="organization" {...bind('company')} />
      <Field
        label="Email"
        type="email"
        autoComplete="email"
        inputMode="email"
        error={errors.email}
        {...bind('email')}
      />
      <Field
        label="Phone"
        type="tel"
        autoComplete="tel"
        inputMode="tel"
        error={errors.phone}
        hint="Email or phone - whichever you prefer."
        {...bind('phone')}
      />
      {showLocation && (
        <Field
          label="Where are you based?"
          optional
          className="span-2"
          autoComplete="address-level2"
          placeholder="City, state"
          {...bind('location')}
        />
      )}
      {showBestTime && (
        <Field
          label="Best time to reach you"
          optional
          className="span-2"
          placeholder="e.g. Weekday mornings, Central time"
          {...bind('bestTime')}
        />
      )}
    </div>
  );
}
