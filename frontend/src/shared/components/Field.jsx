import { useId } from 'react';

export default function Field({ label, optional, hint, error, as = 'input', className = '', children, ...props }) {
  const id = useId();
  const Control = as;
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined;

  return (
    <div className={`field${error ? ' field--invalid' : ''} ${className}`}>
      <label className="field__label" htmlFor={id}>
        {label}
        {optional && <span className="field__optional">(optional)</span>}
      </label>
      <Control id={id} className="field__control" aria-invalid={!!error} aria-describedby={describedBy} {...props}>
        {children}
      </Control>
      {hint && (
        <span id={`${id}-hint`} className="field__hint">
          {hint}
        </span>
      )}
      {error && (
        <span id={`${id}-error`} className="field__error">
          {error}
        </span>
      )}
    </div>
  );
}
