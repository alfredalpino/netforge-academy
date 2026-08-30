"use client";

import { useEffect } from "react";

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable;
}

export interface TodayKeyboardActions {
  onPrevDay: () => void;
  onNextDay: () => void;
  onCompleteBlock: (blockIndex: number) => void;
  onShowHelp: () => void;
  onHideHelp: () => void;
  helpOpen: boolean;
}

export function useTodayKeyboard({
  onPrevDay,
  onNextDay,
  onCompleteBlock,
  onShowHelp,
  onHideHelp,
  helpOpen,
}: TodayKeyboardActions): void {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target)) return;

      const key = event.key.toLowerCase();

      if (key === "?" || (event.shiftKey && key === "/")) {
        event.preventDefault();
        if (helpOpen) onHideHelp();
        else onShowHelp();
        return;
      }

      if (helpOpen && key === "escape") {
        event.preventDefault();
        onHideHelp();
        return;
      }

      if (helpOpen) return;

      if (key === "n" || key === "arrowright") {
        event.preventDefault();
        onNextDay();
        return;
      }

      if (key === "p" || key === "arrowleft") {
        event.preventDefault();
        onPrevDay();
        return;
      }

      const blockNum = Number(key);
      if (blockNum >= 1 && blockNum <= 5) {
        event.preventDefault();
        onCompleteBlock(blockNum - 1);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    helpOpen,
    onCompleteBlock,
    onHideHelp,
    onNextDay,
    onPrevDay,
    onShowHelp,
  ]);
}
