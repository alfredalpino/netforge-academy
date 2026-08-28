interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <header className="mb-8 flex flex-wrap items-start justify-between gap-4 border-b border-border/60 pb-6">
      <div className="min-w-0 flex-1">
        {eyebrow && (
          <p className="text-xs font-medium uppercase tracking-widest text-accent">{eyebrow}</p>
        )}
        <h1 className={`font-semibold tracking-tight ${eyebrow ? "mt-1" : ""} text-2xl sm:text-3xl`}>
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">{description}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  );
}
