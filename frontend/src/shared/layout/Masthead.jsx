import { useEffect, useRef } from 'react';
import { useUiStore } from '../store/ui.store';

export default function Masthead() {
  const ref = useRef(null);
  const setMastheadVisible = useUiStore((s) => s.setMastheadVisible);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setMastheadVisible(entry.isIntersecting), {
      threshold: 0.15,
    });
    observer.observe(ref.current);
    return () => {
      observer.disconnect();
      setMastheadVisible(false);
    };
  }, [setMastheadVisible]);

  return (
    <div className="masthead" ref={ref}>
      <img
        src="/images/logo.jpg"
        alt="Sparka Solutions - The Right Technology. The Right Solution."
        width="1200"
        height="800"
        fetchPriority="high"
      />
    </div>
  );
}
