"use client";

import { useEffect, useRef } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";

export type TerminalPaneProps = {
  lines: string[];
  prompt: string;
  disabled?: boolean;
  onSubmitLine: (line: string) => void;
  /** Bump when selection/lab changes to reprint banner */
  resetKey?: string;
};

export function TerminalPane({
  lines,
  prompt,
  disabled = false,
  onSubmitLine,
  resetKey = "",
}: TerminalPaneProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<Terminal | null>(null);
  const fitRef = useRef<FitAddon | null>(null);
  const bufferRef = useRef("");
  const linesLenRef = useRef(0);
  const onSubmitRef = useRef(onSubmitLine);
  const promptRef = useRef(prompt);
  const disabledRef = useRef(disabled);

  useEffect(() => {
    onSubmitRef.current = onSubmitLine;
    promptRef.current = prompt;
    disabledRef.current = disabled;
  }, [disabled, onSubmitLine, prompt]);

  useEffect(() => {
    if (!hostRef.current) return;
    const term = new Terminal({
      cursorBlink: true,
      fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
      fontSize: 13,
      theme: {
        background: "#02060b",
        foreground: "#d7e2ef",
        cursor: "#4aa3ff",
        selectionBackground: "rgba(74,163,255,0.35)",
      },
      convertEol: true,
    });
    const fit = new FitAddon();
    term.loadAddon(fit);
    term.open(hostRef.current);
    fit.fit();
    termRef.current = term;
    fitRef.current = fit;
    bufferRef.current = "";
    linesLenRef.current = 0;

    term.writeln("NetForgeOS terminal — educational Cisco-style CLI (not Cisco IOS).");
    term.write(`${prompt} `);

    const onData = term.onData((data) => {
      if (disabledRef.current) return;
      for (const ch of data) {
        if (ch === "\r") {
          const line = bufferRef.current;
          bufferRef.current = "";
          term.write("\r\n");
          onSubmitRef.current(line);
          return;
        }
        if (ch === "\u007f") {
          if (bufferRef.current.length > 0) {
            bufferRef.current = bufferRef.current.slice(0, -1);
            term.write("\b \b");
          }
          return;
        }
        if (ch >= " " || ch === "\t") {
          bufferRef.current += ch;
          term.write(ch);
        }
      }
    });

    const onResize = () => fit.fit();
    window.addEventListener("resize", onResize);

    return () => {
      onData.dispose();
      window.removeEventListener("resize", onResize);
      term.dispose();
      termRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount once; resetKey remounts via key on parent
  }, [resetKey]);

  useEffect(() => {
    const term = termRef.current;
    if (!term) return;
    while (linesLenRef.current < lines.length) {
      const line = lines[linesLenRef.current++];
      // Commands already echoed by local typing; skip exact prompt echoes if needed
      term.writeln(line);
    }
    term.write(`${prompt} `);
  }, [lines, prompt]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div ref={hostRef} className="sim-terminal min-h-0 flex-1 px-2 py-1" />
      {disabled && (
        <p className="border-t border-border px-3 py-1 text-[0.7rem] text-muted">
          Select a device to type commands.
        </p>
      )}
    </div>
  );
}
