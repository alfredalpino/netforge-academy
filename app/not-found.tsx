import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { PageShell } from "@/components/ui/PageShell";
import { EmptyState } from "@/components/ui/EmptyState";

export default function NotFound() {
  return (
    <PageShell narrow className="flex min-h-[60vh] items-center justify-center">
      <EmptyState
        title="Page not found"
        description="This route doesn't exist in NetForge. Return to your dashboard or continue today's plan."
        action={
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/">
              <Button>Go to Dashboard</Button>
            </Link>
            <Link href="/today">
              <Button variant="secondary">View Today</Button>
            </Link>
          </div>
        }
      />
      <p className="sr-only">404</p>
    </PageShell>
  );
}
