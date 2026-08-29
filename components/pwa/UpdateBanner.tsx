"use client";

import { Button } from "@/components/ui/Button";

export function UpdateBanner({
  onUpdate,
  onDismiss,
}: {
  onUpdate: () => void;
  onDismiss: () => void;
}) {
  return (
    <div
      role="status"
      className="fixed left-0 right-0 top-0 z-[130] border-b border-border bg-surface px-4 py-3"
      style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
    >
      <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-foreground">
          A new version of NetForge is ready. Update now to get the latest improvements.
        </p>
        <div className="flex gap-2">
          <Button type="button" onClick={onUpdate}>
            Update now
          </Button>
          <Button type="button" variant="secondary" onClick={onDismiss}>
            Later
          </Button>
        </div>
      </div>
    </div>
  );
}
