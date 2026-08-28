interface BadgeProps {
  children: React.ReactNode;
  tone?: "default" | "accent" | "success" | "warning";
}

const tones = {
  default: "border border-border text-muted",
  accent: "bg-accent/10 text-accent",
  success: "bg-success/15 text-success",
  warning: "bg-warning/10 text-warning",
};

export function Badge({ children, tone = "default" }: BadgeProps) {
  return (
    <span className={`inline-flex rounded-full px-3 py-0.5 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}
