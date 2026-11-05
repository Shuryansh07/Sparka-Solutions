import { Bookmark, Copy } from 'lucide-react';
import { useState } from 'react';
import { useUiStore } from '../../../shared/store/ui.store';
import { useDiscoveryStore } from '../store/discovery.store';

export default function SaveForLater({ route }) {
  const saveDraft = useDiscoveryStore((s) => s.saveDraft);
  const busy = useDiscoveryStore((s) => s.busy);
  const showToast = useUiStore((s) => s.showToast);
  const [link, setLink] = useState('');

  const onSave = async () => {
    const token = await saveDraft(route);
    if (token) {
      setLink(`${window.location.origin}/discovery/resume/${token}`);
      showToast('Progress saved');
    }
  };

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      showToast('Resume link copied');
    } catch {
      showToast('Select the link to copy it');
    }
  };

  return (
    <div className="save-later">
      <button type="button" className="btn btn--ghost btn--sm btn--block" onClick={onSave} disabled={busy}>
        <Bookmark /> Save &amp; finish later
      </button>
      {link && (
        <div className="save-later__link">
          <label htmlFor="resume-link">Your resume link</label>
          <div>
            <input id="resume-link" readOnly value={link} onFocus={(e) => e.target.select()} />
            <button type="button" onClick={onCopy} aria-label="Copy resume link">
              <Copy />
            </button>
          </div>
          <small>Keep this link to pick up where you left off on any device.</small>
        </div>
      )}
    </div>
  );
}
