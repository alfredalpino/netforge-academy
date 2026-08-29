"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import type { DeviceType } from "@/simulation/core/types";

export type DeviceNodeData = {
  label: string;
  deviceType: DeviceType;
  selected?: boolean;
  hopping?: boolean;
};

export type DeviceFlowNode = Node<DeviceNodeData, "device">;

const ICON: Record<DeviceType, string> = {
  router: "/simulator/icons/router.svg",
  switch: "/simulator/icons/switch.svg",
  host: "/simulator/icons/host.svg",
  server: "/simulator/icons/server.svg",
};

const ROLE: Record<DeviceType, string> = {
  router: "Router · NetForgeOS",
  switch: "Switch · L2",
  host: "Host · End station",
  server: "Server · End station",
};

function DeviceNodeComponent({ data, selected }: NodeProps<DeviceFlowNode>) {
  return (
    <div
      className={`flex w-[108px] flex-col items-center rounded-xl border bg-surface-elevated/95 px-2 py-2 shadow-sm transition ${
        selected
          ? "border-accent ring-2 ring-accent/40"
          : data.hopping
            ? "border-success/70"
            : "border-border"
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!h-2.5 !w-2.5 !border-border !bg-[color:var(--sim-link)]"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!h-2.5 !w-2.5 !border-border !bg-[color:var(--sim-link)]"
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={ICON[data.deviceType]}
        alt=""
        width={44}
        height={44}
        className="rounded-md"
        draggable={false}
      />
      <p className="mt-1 truncate text-center text-xs font-semibold text-foreground">
        {data.label}
      </p>
      <p className="truncate text-center text-[0.6rem] text-muted">
        {ROLE[data.deviceType]}
      </p>
    </div>
  );
}

export const DeviceNode = memo(DeviceNodeComponent);
