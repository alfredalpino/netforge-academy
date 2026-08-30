interface PageShellProps {
  children: React.ReactNode;
  className?: string;
  narrow?: boolean;
  testId?: string;
}

export function PageShell({ children, className = "", narrow = false, testId }: PageShellProps) {
  return (
    <div
      data-testid={testId}
      className={`page-shell mx-auto w-full px-4 py-8 sm:px-8 sm:py-12 ${
        narrow ? "max-w-2xl" : "max-w-6xl"
      } ${className}`}
    >
      {children}
    </div>
  );
}
