import { Loader2, Mic } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const MAX_SECONDS = 120;
const TAP_HINT = 'Hold the button down while you speak, then let go.';
const MIN_MS = 600;
// First format the browser can record wins (Chrome/Firefox: webm/opus, Safari: mp4).
const MIME_TYPES = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus'];

const supported = () =>
  typeof window !== 'undefined' && !!navigator.mediaDevices?.getUserMedia && typeof window.MediaRecorder !== 'undefined';

const pickMimeType = () => MIME_TYPES.find((t) => MediaRecorder.isTypeSupported(t)) || '';

const clock = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

/**
 * Hold-to-talk button. Records while pressed (pointer or Space/Enter), then hands the audio
 * Blob to onRecorded. `busy` shows the transcribing state; errors go to onError.
 */
export default function VoiceButton({ onRecorded, onError, busy = false, disabled = false }) {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const rec = useRef(null); // { recorder, stream, chunks, startedAt, timer }
  const held = useRef(false); // true between press and release

  useEffect(() => () => stop(true), []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!supported()) return null;

  async function start() {
    held.current = true;
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      held.current = false;
      onError?.('Microphone access was blocked. Allow it in your browser, or type your notes instead.');
      return;
    }
    // Released before the mic was ready (a quick tap, or while answering the permission prompt).
    if (!held.current) {
      stream.getTracks().forEach((t) => t.stop());
      onError?.(TAP_HINT);
      return;
    }

    const mimeType = pickMimeType();
    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    const chunks = [];
    recorder.ondataavailable = (e) => e.data.size && chunks.push(e.data);
    recorder.start();
    const startedAt = Date.now();
    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      setSeconds(elapsed);
      if (elapsed >= MAX_SECONDS) stop();
    }, 250);
    rec.current = { recorder, stream, chunks, startedAt, timer };
    setSeconds(0);
    setRecording(true);
  }

  function stop(discard = false) {
    held.current = false;
    const r = rec.current;
    if (!r) return;
    rec.current = null;
    clearInterval(r.timer);
    setRecording(false);
    const tooShort = Date.now() - r.startedAt < MIN_MS;
    r.recorder.onstop = () => {
      r.stream.getTracks().forEach((t) => t.stop());
      if (discard) return;
      if (tooShort) return onError?.(TAP_HINT);
      const type = (r.recorder.mimeType || 'audio/webm').split(';')[0];
      onRecorded(new Blob(r.chunks, { type }));
    };
    if (r.recorder.state !== 'inactive') r.recorder.stop();
  }

  const press = (e) => {
    if (disabled || busy || recording) return;
    e.preventDefault();
    // Keep receiving pointerup even if the finger/cursor slides off the button.
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* not an active pointer (e.g. synthetic event); release still works on the button */
    }
    start();
  };
  const release = () => held.current && stop();
  const keyDown = (e) => {
    if ((e.key === ' ' || e.key === 'Enter') && !e.repeat && !recording && !busy && !disabled) {
      e.preventDefault();
      start();
    }
  };
  const keyUp = (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      release();
    }
  };

  const label = busy ? 'Transcribing…' : recording ? `Recording ${clock(seconds)} · release to send` : 'Hold to talk';

  return (
    <Button
      type="button"
      size="lg"
      variant="outline"
      disabled={disabled || busy}
      aria-pressed={recording}
      aria-label={recording ? 'Recording, release to send' : 'Hold to talk: record your notes by voice'}
      onPointerDown={press}
      onPointerUp={release}
      onPointerCancel={release}
      onKeyDown={keyDown}
      onKeyUp={keyUp}
      onContextMenu={(e) => e.preventDefault()}
      className={cn(
        'touch-none select-none',
        recording && 'border-destructive bg-destructive/10 text-destructive hover:bg-destructive/10'
      )}
    >
      {busy ? (
        <Loader2 className="animate-spin" />
      ) : (
        <span className="relative flex">
          {recording && <span className="absolute inset-0 animate-ping rounded-full bg-destructive/40" />}
          <Mic className="relative" />
        </span>
      )}
      <span className="tabular-nums">{label}</span>
    </Button>
  );
}
