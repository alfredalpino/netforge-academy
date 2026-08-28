"use client";

import { useState } from "react";
import { RESOURCES, RESOURCE_TYPES } from "@/lib/resources";
import type { ResourceType } from "@/lib/types";
import { PHASES } from "@/lib/curriculum";
import { PageShell } from "@/components/ui/PageShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";

export default function ResourcesPage() {
  const [filter, setFilter] = useState<ResourceType | "all">("all");
  const [phaseFilter, setPhaseFilter] = useState<string>("all");
  const [freeOnly, setFreeOnly] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = RESOURCES.filter((r) => {
    if (filter !== "all" && r.type !== filter) return false;
    if (phaseFilter !== "all" && !r.phases?.includes(phaseFilter)) return false;
    if (freeOnly && !r.free) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const grouped = RESOURCE_TYPES.map((type) => ({
    ...type,
    resources: filtered.filter((r) => r.type === type.id),
  })).filter((g) => g.resources.length > 0);

  const clearFilters = () => {
    setFilter("all");
    setPhaseFilter("all");
    setFreeOnly(false);
    setSearch("");
  };

  return (
    <PageShell>
      <PageHeader
        eyebrow="Learning Resources"
        title="Resource Library"
        description={`${RESOURCES.length} curated links — documentation, books, labs, cert prep, and tools.`}
      />

      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Input
          id="resource-search"
          label="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title, tag..."
          className="sm:col-span-2 lg:col-span-1"
        />
        <Select
          id="resource-type"
          label="Type"
          value={filter}
          onChange={(e) => setFilter(e.target.value as ResourceType | "all")}
          className="w-full"
        >
          <option value="all">All types</option>
          {RESOURCE_TYPES.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </Select>
        <Select
          id="resource-phase"
          label="Phase"
          value={phaseFilter}
          onChange={(e) => setPhaseFilter(e.target.value)}
          className="w-full"
        >
          <option value="all">All phases</option>
          {PHASES.map((p) => (
            <option key={p.id} value={p.id}>
              Phase {p.number}: {p.title}
            </option>
          ))}
        </Select>
        <div className="flex flex-col justify-end gap-2">
          <label htmlFor="free-only" className="flex items-center gap-2 text-sm text-muted">
            <input
              id="free-only"
              type="checkbox"
              checked={freeOnly}
              onChange={(e) => setFreeOnly(e.target.checked)}
              className="accent-accent"
            />
            Free only
          </label>
          <span className="text-xs text-muted">
            {filtered.length} result{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No resources match your filters"
          description="Try clearing filters or broadening your search."
          action={
            <Button variant="secondary" onClick={clearFilters}>
              Clear filters
            </Button>
          }
        />
      ) : (
        <div className="space-y-10">
          {grouped.map((group) => (
            <section key={group.id}>
              <h2 className="mb-4 flex items-center gap-2 text-sm font-medium">
                {group.label}
                <Badge>{group.resources.length}</Badge>
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {group.resources.map((resource) => (
                  <a
                    key={resource.id}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col rounded-xl border border-border bg-surface p-5 transition hover:border-accent/40 hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-medium transition-colors group-hover:text-accent">
                        {resource.title}
                      </h3>
                      <span className="shrink-0 text-xs text-muted" aria-label="Opens in new tab">
                        ↗
                      </span>
                    </div>
                    <p className="mt-2 flex-1 text-xs leading-relaxed text-muted line-clamp-3">
                      {resource.description}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-1.5">
                      {resource.free && <Badge tone="success">Free</Badge>}
                      {resource.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag}>{tag}</Badge>
                      ))}
                      {resource.tags.length > 3 && (
                        <span className="text-xs text-muted">+{resource.tags.length - 3}</span>
                      )}
                    </div>
                  </a>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </PageShell>
  );
}
