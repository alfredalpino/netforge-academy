import { type SelectHTMLAttributes, forwardRef } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, id, className = "", children, ...props },
  ref
) {
  const selectId = id ?? props.name;

  return (
    <div>
      {label && (
        <label htmlFor={selectId} className="text-xs text-muted">
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={selectId}
        className={`${label ? "mt-1" : ""} rounded-lg border border-border bg-surface px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${className}`}
        {...props}
      >
        {children}
      </select>
    </div>
  );
});
