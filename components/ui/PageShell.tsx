interface PageShellProps {
  children: React.ReactNode;
  className?: string;
  narrow?: boolean;
}

export function PageShell({ children, className = "", narrow = false }: PageShellProps) {
  return (
    <div
      className={`page-shell mx-auto w-full px-4 py-8 sm:px-6 sm:py-10 ${
        narrow ? "max-w-2xl" : "max-w-6xl"
      } ${className}`}
    >
      {children}
    </div>
  );
}
