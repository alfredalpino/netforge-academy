"use client";

import { memo, useCallback } from "react";
import {
  Handle,
  NodeResizer,
  Position,
  type NodeProps,
  type Node,
} from "@xyflow/react";
import type { DeviceType } from "@/simulation/core/types";
import { useSimulatorStore } from "@/features/simulator/store/simulatorStore";

export const DEFAULT_NODE_WIDTH = 64;
export const DEFAULT_NODE_HEIGHT = 72;

export type DeviceNodeData = {
  label: string;
  deviceType: DeviceType;
  hopping?: boolean;
  width: number;
  height: number;
};

export type DeviceFlowNode = Node<DeviceNodeData, "device">;

const ICON: Record<DeviceType, string> = {
  router: "/simulator/icons/router.svg",
  switch: "/simulator/icons/switch.svg",
  host: "/simulator/icons/host.svg",
  server: "/simulator/icons/server.svg",
};

function DeviceNodeComponent({ id, data, selected }: NodeProps<DeviceFlowNode>) {
  const patchNodeLayout = useSimulatorStore((s) => s.patchNodeLayout);

  const onResizeEnd = useCallback(
    (_event: unknown, params: { width: number; height: number }) => {
      patchNodeLayout(id, { width: params.width, height: params.height });
    },
    [id, patchNodeLayout],
  );

  const iconSize = Math.round(Math.min(data.width, data.height) * 0.52);

  return (
    <div
      data-testid={`device-node-${id}`}
      className={`sim-device-node relative flex flex-col items-center justify-center rounded-lg border bg-[#0c1219]/95 shadow-sm transition ${
        selected
          ? "border-accent ring-1 ring-accent/50"
          : data.hopping
            ? "border-success/70"
            : "border-[color:var(--sim-grid)]"
      }`}
      style={{ width: data.width, height: data.height }}
    >
      <NodeResizer
        minWidth={48}
        minHeight={48}
        maxWidth={128}
        maxHeight={120}
        isVisible={selected}
        lineClassName="!border-accent/70"
        handleClassName="!h-1.5 !w-1.5 !rounded-sm !border !border-accent/80 !bg-accent"
        onResizeEnd={onResizeEnd}
      />
      <Handle
        type="target"
        position={Position.Left}
        className="!-left-1 !h-2 !w-2 !border-border !bg-[color:var(--sim-link)]"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!-right-1 !h-2 !w-2 !border-border !bg-[color:var(--sim-link)]"
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={ICON[data.deviceType]}
        alt=""
        width={iconSize}
        height={iconSize}
        className="pointer-events-none select-none object-contain"
        draggable={false}
      />
      <p
        className="pointer-events-none absolute -bottom-5 left-1/2 max-w-[120px] -translate-x-1/2 truncate text-center text-[0.625rem] font-medium text-foreground"
        title={data.label}
      >
        {data.label}
      </p>
    </div>
  );
}

export const DeviceNode = memo(DeviceNodeComponent);
