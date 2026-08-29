"use client";

export function StubPane({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-1 px-4 text-center">
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="max-w-md text-[0.75rem] leading-relaxed text-muted">{description}</p>
    </div>
  );
}
