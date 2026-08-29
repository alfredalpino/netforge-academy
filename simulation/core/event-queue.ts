import type { SimulationEvent } from "./types";

interface HeapItem {
  t: number;
  seq: number;
  event: SimulationEvent;
}

/** Min-heap event queue ordered by simulation time, then insertion seq. */
export class EventQueue {
  private heap: HeapItem[] = [];
  private seq = 0;

  get size(): number {
    return this.heap.length;
  }

  clear(): void {
    this.heap = [];
    this.seq = 0;
  }

  push(event: SimulationEvent): void {
    const item: HeapItem = { t: event.t, seq: this.seq++, event };
    this.heap.push(item);
    this.bubbleUp(this.heap.length - 1);
  }

  peek(): SimulationEvent | undefined {
    return this.heap[0]?.event;
  }

  pop(): SimulationEvent | undefined {
    if (this.heap.length === 0) return undefined;
    const top = this.heap[0];
    const last = this.heap.pop()!;
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this.bubbleDown(0);
    }
    return top.event;
  }

  private bubbleUp(i: number): void {
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (this.less(this.heap[i], this.heap[p])) {
        [this.heap[i], this.heap[p]] = [this.heap[p], this.heap[i]];
        i = p;
      } else break;
    }
  }

  private bubbleDown(i: number): void {
    const n = this.heap.length;
    for (;;) {
      const l = i * 2 + 1;
      const r = l + 1;
      let smallest = i;
      if (l < n && this.less(this.heap[l], this.heap[smallest])) smallest = l;
      if (r < n && this.less(this.heap[r], this.heap[smallest])) smallest = r;
      if (smallest === i) break;
      [this.heap[i], this.heap[smallest]] = [this.heap[smallest], this.heap[i]];
      i = smallest;
    }
  }

  private less(a: HeapItem, b: HeapItem): boolean {
    if (a.t !== b.t) return a.t < b.t;
    return a.seq < b.seq;
  }
}
