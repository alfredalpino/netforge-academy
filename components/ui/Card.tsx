import { type HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLElement> {
  as?: "div" | "section" | "article";
}

export function Card({ as: Tag = "div", className = "", children, ...props }: CardProps) {
  return (
    <Tag
      className={`rounded-xl border border-border bg-surface p-6 ${className}`}
      {...props}
    >
      {children}
    </Tag>
  );
}
