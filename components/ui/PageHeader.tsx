interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <header className="mb-10 flex flex-wrap items-start justify-between gap-4 border-b border-border/70 pb-8">
      <div className="min-w-0 flex-1">
        {eyebrow && <p className="section-label text-accent">{eyebrow}</p>}
        <h1
          className={`font-display font-semibold tracking-tight text-balance ${
            eyebrow ? "mt-2" : ""
          } text-3xl sm:text-4xl`}
        >
          {title}
        </h1>
        {description && (
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted sm:text-[0.9375rem]">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  );
}
