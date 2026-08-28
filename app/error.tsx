"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { PageShell } from "@/components/ui/PageShell";
import { EmptyState } from "@/components/ui/EmptyState";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <PageShell narrow className="flex min-h-[60vh] items-center justify-center">
      <EmptyState
        title="Something went wrong"
        description="NetForge hit an unexpected error. Your progress is stored locally and should be safe."
        action={
          <div className="flex flex-wrap justify-center gap-3">
            <Button onClick={reset}>Try again</Button>
            <Button variant="secondary" onClick={() => router.push("/")}>
              Go to Dashboard
            </Button>
          </div>
        }
      />
    </PageShell>
  );
}
