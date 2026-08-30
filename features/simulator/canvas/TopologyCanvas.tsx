"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  useReactFlow,
  type Connection,
  type Edge,
  type Node,
  type OnNodeDrag,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  DeviceNode,
  DEFAULT_NODE_HEIGHT,
  DEFAULT_NODE_WIDTH,
  type DeviceFlowNode,
} from "./DeviceNode";
import type { DeviceType, NetworkDevice, NetworkLink } from "@/simulation/core/types";
import type { CanvasLayout } from "@/features/simulator/store/simulatorStore";

const nodeTypes = { device: DeviceNode };

export type TopologyCanvasProps = {
  devices: NetworkDevice[];
  links: NetworkLink[];
  positions: Record<string, CanvasLayout>;
  selectedId: string | null;
  hopDeviceIds: string[];
  layoutKey: string;
  onSelect: (id: string | null) => void;
  onPositionsChange: (positions: Record<string, CanvasLayout>) => void;
  onConnectDevices: (
    a: { deviceId: string; interfaceName: string },
    b: { deviceId: string; interfaceName: string },
  ) => void;
};

function firstFreeIface(device: NetworkDevice, used: Set<string>): string | null {
  for (const iface of device.interfaces) {
    if (!used.has(iface.id)) return iface.name;
  }
  return null;
}

function FitViewOnLoad({ layoutKey, count }: { layoutKey: string; count: number }) {
  const { fitView } = useReactFlow();
  const seenRef = useRef<string | null>(null);

  useEffect(() => {
    if (count === 0) return;
    if (seenRef.current === layoutKey) return;
    seenRef.current = layoutKey;
    const id = requestAnimationFrame(() => {
      void fitView({ padding: 0.3, maxZoom: 1, minZoom: 0.45, duration: 200 });
    });
    return () => cancelAnimationFrame(id);
  }, [count, fitView, layoutKey]);

  return null;
}

function TopologyCanvasInner({
  devices,
  links,
  positions,
  selectedId,
  hopDeviceIds,
  layoutKey,
  onSelect,
  onPositionsChange,
  onConnectDevices,
}: TopologyCanvasProps) {
  const usedIfaces = useMemo(() => {
    const s = new Set<string>();
    for (const l of links) {
      s.add(l.a.interfaceId);
      s.add(l.b.interfaceId);
    }
    return s;
  }, [links]);

  const nodes: DeviceFlowNode[] = useMemo(
    () =>
      devices.map((d, i) => {
        const layout = positions[d.id];
        const width = layout?.width ?? DEFAULT_NODE_WIDTH;
        const height = layout?.height ?? DEFAULT_NODE_HEIGHT;
        return {
          id: d.id,
          type: "device" as const,
          position: {
            x: layout?.x ?? 80 + (i % 4) * 120,
            y: layout?.y ?? 80 + Math.floor(i / 4) * 100,
          },
          width,
          height,
          selected: d.id === selectedId,
          data: {
            label: d.name,
            deviceType: d.type as DeviceType,
            hopping: hopDeviceIds.includes(d.id),
            width,
            height,
          },
        };
      }),
    [devices, hopDeviceIds, positions, selectedId],
  );

  const edges: Edge[] = useMemo(
    () =>
      links.map((l) => ({
        id: l.id,
        source: l.a.deviceId,
        target: l.b.deviceId,
        animated:
          hopDeviceIds.includes(l.a.deviceId) && hopDeviceIds.includes(l.b.deviceId),
        style: {
          stroke:
            hopDeviceIds.includes(l.a.deviceId) && hopDeviceIds.includes(l.b.deviceId)
              ? "var(--sim-link-up)"
              : "var(--sim-link)",
          strokeWidth: 2,
        },
      })),
    [hopDeviceIds, links],
  );

  const onNodeDragStop: OnNodeDrag = useCallback(
    (_e, node) => {
      const prev = positions[node.id] ?? {};
      onPositionsChange({
        ...positions,
        [node.id]: {
          ...prev,
          x: node.position.x,
          y: node.position.y,
        },
      });
    },
    [onPositionsChange, positions],
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) return;
      const aDev = devices.find((d) => d.id === connection.source);
      const bDev = devices.find((d) => d.id === connection.target);
      if (!aDev || !bDev) return;
      const aName = firstFreeIface(aDev, usedIfaces);
      const bName = firstFreeIface(bDev, usedIfaces);
      if (!aName || !bName) return;
      onConnectDevices(
        { deviceId: aDev.id, interfaceName: aName },
        { deviceId: bDev.id, interfaceName: bName },
      );
    },
    [devices, onConnectDevices, usedIfaces],
  );

  return (
    <div className="sim-canvas-surface relative h-full min-h-[240px] w-full">
      <ReactFlow
        nodes={nodes as Node[]}
        edges={edges}
        onNodeClick={(_e, node) => onSelect(node.id)}
        onPaneClick={() => onSelect(null)}
        onConnect={onConnect}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={nodeTypes}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        minZoom={0.35}
        maxZoom={1.75}
        colorMode="dark"
        nodesDraggable
        elementsSelectable={false}
        nodesConnectable
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="var(--sim-grid)"
        />
        <Controls showInteractive={false} />
        <MiniMap
          nodeColor={() => "#1c2533"}
          maskColor="rgba(7,11,18,0.7)"
          className="!bg-surface"
        />
        <FitViewOnLoad layoutKey={layoutKey} count={devices.length} />
      </ReactFlow>
      {devices.length === 0 && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center">
          <p className="font-display text-base font-semibold text-foreground">
            Empty topology
          </p>
          <p className="max-w-sm text-sm text-muted">
            Load Sample, or place devices from the palette and drag links between handles.
          </p>
        </div>
      )}
    </div>
  );
}

export function TopologyCanvas(props: TopologyCanvasProps) {
  return (
    <ReactFlowProvider>
      <TopologyCanvasInner {...props} />
    </ReactFlowProvider>
  );
}
