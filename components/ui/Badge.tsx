interface BadgeProps {
  children: React.ReactNode;
  tone?: "default" | "accent" | "success" | "warning";
}

const tones = {
  default: "border border-border bg-surface/70 text-muted",
  accent: "border border-accent/20 bg-accent/10 text-accent",
  success: "border border-success/20 bg-success/10 text-success",
  warning: "border border-warning/20 bg-warning/10 text-warning",
};

export function Badge({ children, tone = "default" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-[0.6875rem] font-semibold tracking-wide ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
