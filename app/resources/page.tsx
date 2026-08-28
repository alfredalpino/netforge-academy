"use client";

import { useState } from "react";
import { RESOURCES, RESOURCE_TYPES } from "@/lib/resources";
import type { ResourceType } from "@/lib/types";
import { PHASES } from "@/lib/curriculum";

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

  return (
    <div className="p-8">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-widest text-accent">Learning Resources</p>
        <h1 className="mt-1 text-2xl font-semibold">Resource Library</h1>
        <p className="mt-1 text-sm text-muted">
          {RESOURCES.length} curated resources · docs, books, labs, cert prep, and tools
        </p>
      </header>

      {/* Filters */}
      <div className="mb-8 flex flex-wrap items-center gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search resources..."
          className="rounded-lg border border-border bg-surface px-4 py-2 text-sm w-64"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as ResourceType | "all")}
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm"
        >
          <option value="all">All types</option>
          {RESOURCE_TYPES.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
        <select
          value={phaseFilter}
          onChange={(e) => setPhaseFilter(e.target.value)}
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm"
        >
          <option value="all">All phases</option>
          {PHASES.map((p) => (
            <option key={p.id} value={p.id}>
              Phase {p.number}: {p.title}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm text-muted">
          <input
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

      {/* Resource groups */}
      <div className="space-y-10">
        {grouped.map((group) => (
          <section key={group.id}>
            <h2 className="mb-4 text-sm font-medium">
              {group.label}
              <span className="ml-2 text-xs text-muted">({group.resources.length})</span>
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {group.resources.map((resource) => (
                <a
                  key={resource.id}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group rounded-xl border border-border bg-surface p-5 transition hover:border-accent/40 hover:bg-surface-hover"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-medium group-hover:text-accent transition-colors">
                      {resource.title}
                    </h3>
                    {resource.free && (
                      <span className="shrink-0 rounded-full bg-success/15 px-2 py-0.5 text-xs text-success">
                        Free
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-xs text-muted leading-relaxed line-clamp-2">
                    {resource.description}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {resource.tags.slice(0, 4).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-border/50 px-2 py-0.5 text-xs text-muted"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </a>
              ))}
            </div>
          </section>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-muted py-12">No resources match your filters.</p>
      )}
    </div>
  );
}
