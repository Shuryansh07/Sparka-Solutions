import { ArrowLeft, Send, Sparkles } from 'lucide-react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ChipGroup from '../../../shared/components/ChipGroup';
import Field from '../../../shared/components/Field';
import Notice from '../../../shared/components/Notice';
import ContactFields from '../components/ContactFields';
import DiscoveryShell from '../components/DiscoveryShell';
import { FLEET_SIZES, INSTALLATION, TIMINGS, validateContact } from '../lib/flow';
import { useDiscoveryStore } from '../store/discovery.store';

function Select({ label, value, options, onChange }) {
  return (
    <Field as="select" label={label} optional value={value || ''} onChange={(e) => onChange(e.target.value)}>
      <option value="">Not specified</option>
      {options.map((o) => (
        <option key={o}>{o}</option>
      ))}
    </Field>
  );
}

export default function DescribePage() {
  const navigate = useNavigate();
  const s = useDiscoveryStore();
  const { narrative, organized, describeStage, library, loadLibrary, busy, error } = s;
  const interestOptions = library?.questions.find((q) => q.id === 'interests')?.options || [];

  useEffect(() => {
    loadLibrary();
  }, [loadLibrary]);

  const onOrganize = (e) => {
    e.preventDefault();
    s.organizeNarrative();
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const errors = validateContact(s.contact);
    if (Object.keys(errors).length) return s.setFieldErrors(errors);
    if (await s.submit('describe')) navigate('/discovery/thanks');
  };

  return (
    <DiscoveryShell
      route="describe"
      title="I’ll Tell You What I Need"
      intro="Describe it in your own words - no questionnaire. We’ll organize your notes for you to confirm."
    >
      {describeStage === 'write' ? (
        <form className="panel describe" onSubmit={onOrganize}>
          <Field
            as="textarea"
            label="What are you looking for?"
            className="describe__text"
            rows={9}
            maxLength={8000}
            placeholder="For example: We run 40 service vans in the Dallas area and want forward-facing cameras and GPS tracking. Our current trackers are old and drivers don't like the app. Hoping to have something in place next quarter, and we'll need installation."
            hint="Mention anything helpful: vehicles, what you use today, goals, timing, installation, budget."
            value={narrative}
            onChange={(e) => s.setNarrative(e.target.value)}
          />
          {error && <Notice tone="error">{error}</Notice>}
          <div className="wizard__footer">
            <span className="form-footnote">{narrative.length > 0 && `${narrative.length.toLocaleString()} characters`}</span>
            <button type="submit" className="btn btn--primary" disabled={busy || narrative.trim().length < 10}>
              {busy ? <span className="spinner" aria-hidden="true" /> : <Sparkles />} Organize my notes
            </button>
          </div>
        </form>
      ) : (
        <form className="panel describe" onSubmit={onSubmit} noValidate>
          <div>
            <h2 className="question__prompt">Here’s what we heard</h2>
            <p className="question__help">
              We organized your notes automatically - please adjust anything that isn’t quite right.
            </p>
          </div>

          <blockquote className="describe__quote">{narrative}</blockquote>

          <div className="field">
            <span className="field__label">Areas you mentioned</span>
            <ChipGroup
              label="Areas you mentioned"
              options={interestOptions}
              value={organized?.interests || []}
              onChange={(interests) => s.setOrganized({ interests })}
            />
          </div>

          <div className="form-grid form-grid--3">
            <Select label="Fleet size" value={organized?.fleetSize} options={FLEET_SIZES} onChange={(fleetSize) => s.setOrganized({ fleetSize })} />
            <Select label="Timing" value={organized?.timing} options={TIMINGS} onChange={(timing) => s.setOrganized({ timing })} />
            <Select
              label="Installation"
              value={organized?.installation}
              options={INSTALLATION}
              onChange={(installation) => s.setOrganized({ installation })}
            />
          </div>

          <hr className="divider" />

          <div>
            <h2 className="question__prompt question__prompt--sm">How can we reach you?</h2>
            <p className="question__help">A representative will follow up personally to recap your needs.</p>
          </div>
          <ContactFields />

          {error && <Notice tone="error">{error}</Notice>}

          <div className="wizard__footer">
            <button type="button" className="btn btn--text" onClick={() => s.setDescribeStage('write')}>
              <ArrowLeft /> Edit my notes
            </button>
            <button type="submit" className="btn btn--primary" disabled={busy}>
              {busy ? <span className="spinner" aria-hidden="true" /> : <Send />} Send to Sparka
            </button>
          </div>
        </form>
      )}
    </DiscoveryShell>
  );
}
