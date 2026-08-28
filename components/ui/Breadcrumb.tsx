import Link from "next/link";

interface BreadcrumbProps {
  href: string;
  label: string;
}

export function Breadcrumb({ href, label }: BreadcrumbProps) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1 text-xs text-accent transition hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      <span aria-hidden="true">←</span>
      {label}
    </Link>
  );
}
