import { type InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, id, className = "", ...props },
  ref
) {
  const inputId = id ?? props.name;

  return (
    <div>
      {label && (
        <label htmlFor={inputId} className="text-xs text-muted">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={`mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${className}`}
        {...props}
      />
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
});
