import { type HTMLAttributes } from "react";

type CardVariant = "default" | "quiet" | "elevated" | "accent";

interface CardProps extends HTMLAttributes<HTMLElement> {
  as?: "div" | "section" | "article";
  variant?: CardVariant;
}

const variants: Record<CardVariant, string> = {
  default: "border border-border bg-surface shadow-[var(--shadow-card)]",
  quiet: "card-quiet",
  elevated: "card-elevated",
  accent: "card-accent",
};

export function Card({
  as: Tag = "div",
  variant = "default",
  className = "",
  children,
  ...props
}: CardProps) {
  return (
    <Tag className={`rounded-2xl p-6 ${variants[variant]} ${className}`} {...props}>
      {children}
    </Tag>
  );
}
