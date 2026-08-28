import Link from "next/link";
import { notFound } from "next/navigation";
import { getPhase } from "@/lib/curriculum";
import { ModuleCard } from "@/components/ModuleCard";

export default async function PhasePage({
  params,
}: {
  params: Promise<{ phaseId: string }>;
}) {
  const { phaseId } = await params;
  const phase = getPhase(phaseId);
  if (!phase) notFound();

  return (
    <div className="p-8">
      <Link href="/curriculum" className="text-xs text-accent hover:underline">
        ← Curriculum
      </Link>
      <header className="mt-4 mb-8">
        <span className="font-mono text-xs text-accent">Phase {phase.number}</span>
        <h1 className="mt-1 text-2xl font-semibold">{phase.title}</h1>
        <p className="mt-1 text-muted">
          {phase.weeks} · {phase.objective}
        </p>
      </header>

      <div className="space-y-6">
        {phase.modules.map((mod) => (
          <ModuleCard key={mod.id} module={mod} />
        ))}
      </div>
    </div>
  );
}
