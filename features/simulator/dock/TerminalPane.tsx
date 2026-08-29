"use client";

import { useEffect, useRef } from "react";

export type TerminalPaneProps = {
  lines: string[];
  prompt: string;
  input: string;
  onInputChange: (value: string) => void;
  onSubmitLine: (line: string) => void;
  disabled?: boolean;
};

export function TerminalPane({
  lines,
  prompt,
  input,
  onInputChange,
  onSubmitLine,
  disabled = false,
}: TerminalPaneProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div
        ref={scrollRef}
        className="sim-terminal min-h-0 flex-1 overflow-y-auto whitespace-pre-wrap px-3 py-2"
        aria-live="polite"
        aria-relevant="additions"
      >
        {lines.length === 0 ? (
          <p className="text-muted">
            NetForgeOS terminal — select a device, then type commands. Try{" "}
            <span className="text-accent">enable</span>,{" "}
            <span className="text-accent">configure terminal</span>,{" "}
            <span className="text-accent">ping</span>.
          </p>
        ) : (
          lines.map((line, i) => (
            <div key={`${i}-${line.slice(0, 24)}`}>{line}</div>
          ))
        )}
      </div>
      <form
        className="sim-terminal flex items-center gap-2 border-t border-border px-3 py-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (disabled) return;
          onSubmitLine(input);
        }}
      >
        <label className="sr-only" htmlFor="sim-terminal-input">
          Terminal command
        </label>
        <span className="shrink-0 text-accent">{prompt}</span>
        <input
          id="sim-terminal-input"
          value={input}
          disabled={disabled}
          onChange={(e) => onInputChange(e.target.value)}
          autoComplete="off"
          spellCheck={false}
          className="min-w-0 flex-1 bg-transparent text-foreground outline-none placeholder:text-muted/60"
          placeholder={disabled ? "Select a device…" : "enter command"}
        />
      </form>
    </div>
  );
}
