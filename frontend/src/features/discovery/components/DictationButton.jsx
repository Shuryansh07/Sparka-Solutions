import { useEffect, useRef, useState } from 'react';
import { discoveryApi } from '../api/discovery.api';
import VoiceButton from './VoiceButton';

/**
 * Appends spoken text to an existing answer. Keeps the user's typed text, separating the
 * transcript with a blank line (multiline) or a space, and trims to maxLength.
 */
export function appendTranscript(current, text, { multiline = true, maxLength } = {}) {
  const base = (current || '').trimEnd();
  const next = base ? `${base}${multiline ? '\n\n' : ' '}${text.trim()}` : text.trim();
  return maxLength ? next.slice(0, maxLength) : next;
}

/**
 * Hold-to-talk for a free-text answer: records, transcribes via /discovery/transcribe, then
 * hands the text to onText. Unlike the Describe page, it never submits; the user reviews the
 * text in the field first. Errors (mic blocked, too short, transcription failed) go to onError.
 */
export default function DictationButton({ onText, onError, disabled = false, compact = false, className }) {
  const [busy, setBusy] = useState(false);
  const mounted = useRef(true);
  useEffect(() => {
    // Set on mount too: StrictMode runs effects twice in development (mount, unmount, mount).
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const onRecorded = async (audio) => {
    setBusy(true);
    onError?.(null);
    try {
      const { text } = await discoveryApi.transcribe(audio);
      if (!mounted.current) return;
      if (text?.trim()) onText(text.trim());
      else onError?.('We couldn’t hear anything in that recording. Try again a little closer to the mic.');
    } catch (err) {
      if (mounted.current) onError?.(err.message);
    } finally {
      if (mounted.current) setBusy(false);
    }
  };

  return (
    <VoiceButton
      compact={compact}
      className={className}
      busy={busy}
      disabled={disabled}
      onRecorded={onRecorded}
      onError={onError}
    />
  );
}
