"use client";

import { useCallback, useMemo, useState } from "react";
import { SimTopBar } from "@/features/simulator/chrome/SimTopBar";
import { DevicePalette } from "@/features/simulator/palette/DevicePalette";
import {
  TopologyCanvas,
  type CanvasLink,
  type CanvasNode,
} from "@/features/simulator/canvas/TopologyCanvas";
import {
  InspectorPanel,
  type InspectorSelection,
} from "@/features/simulator/inspector/InspectorPanel";
import { BottomDock, type DockTabId } from "@/features/simulator/dock/BottomDock";
import { TerminalPane } from "@/features/simulator/dock/TerminalPane";
import { PacketsPane } from "@/features/simulator/dock/PacketsPane";
import { EventsPane } from "@/features/simulator/dock/EventsPane";
import { ScorePane } from "@/features/simulator/dock/ScorePane";
import { StubPane } from "@/features/simulator/dock/StubPane";
import { useSimulationEngine } from "@/features/simulator/hooks/useSimulationEngine";
import { BASIC_LAN_LAB } from "@/content/labs/basic-lan";
import {
  applyStartupConfig,
  gradeLab,
  topologyFromLab,
  type GradeReport,
} from "@/simulation/grading/lab-schema";
import {
  saveWorkspace,
  loadWorkspace,
} from "@/features/simulator/persistence/sim-idb";
import type { DeviceType } from "@/simulation/core/types";

const WORKSPACE_ID = "default";

export function SimulatorShell() {
  const engine = useSimulationEngine();
  const [labTitle, setLabTitle] = useState("Untitled lab");
  const [labId, setLabId] = useState<string | null>(null);
  const [nodes, setNodes] = useState<CanvasNode[]>([]);
  const [links, setLinks] = useState<CanvasLink[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dockTab, setDockTab] = useState<DockTabId>("terminal");
  const [termLines, setTermLines] = useState<string[]>([]);
  const [termInput, setTermInput] = useState("");
  const [termPromptByDevice, setTermPromptByDevice] = useState<
    Record<string, string>
  >({});
  const [status, setStatus] = useState("Ready");
  const [grade, setGrade] = useState<GradeReport | null>(null);
  const [hopIds, setHopIds] = useState<string[]>([]);
  const [inspectorTick, setInspectorTick] = useState(0);

  const selectedDevice = selectedId
    ? engine.getController()?.getDevice(selectedId)
    : undefined;

  const termPrompt = selectedId
    ? (termPromptByDevice[selectedId] ??
      `${selectedDevice?.hostname || selectedDevice?.name || selectedId}>`)
    : "netforge>";

  const onSelectDevice = useCallback((id: string | null) => {
    setSelectedId(id);
  }, []);

  const inspector: InspectorSelection = useMemo(() => {
    void inspectorTick;
    const device = selectedId
      ? engine.getController()?.getDevice(selectedId)
      : undefined;
    if (!device) return { kind: "none" };
    return {
      kind: "device",
      id: device.id,
      title: device.name,
      subtitle: `${device.type} · ${device.os}`,
      rows: [
        { label: "Hostname", value: device.hostname },
        { label: "Interfaces", value: String(device.interfaces.length) },
        { label: "ARP", value: String(device.runtime.arpTable.length) },
        { label: "Routes", value: String(device.runtime.routingTable.length) },
        ...device.interfaces.map((i) => ({
          label: i.name,
          value: `${i.ipv4[0]?.address ?? "—"} · ${i.adminStatus}/${i.operationalStatus}`,
        })),
      ],
    };
  }, [engine, inspectorTick, selectedId]);

  const loadBasicLan = useCallback(() => {
    const lab = BASIC_LAN_LAB;
    const topo = topologyFromLab(lab);
    engine.loadTopology(topo, 42);
    const controller = engine.getController();
    if (controller) applyStartupConfig(controller, lab);
    setLabTitle(lab.title);
    setLabId(lab.id);
    setNodes(
      lab.topology.nodes.map((n) => ({
        id: n.id,
        name: n.name,
        type: n.type,
        x: n.position?.x ?? 80,
        y: n.position?.y ?? 120,
      })),
    );
    setLinks(
      lab.topology.links.map((l) => ({
        id: l.id,
        aDeviceId: l.a.deviceId,
        bDeviceId: l.b.deviceId,
      })),
    );
    setSelectedId("PC1");
    setTermPromptByDevice((prev) => ({ ...prev, PC1: "PC1>" }));
    setTermLines([
      "Loaded lab: Basic LAN Connectivity",
      "Configure R1 Gi0/0 = 10.0.0.1/24 and PC1 eth0 = 10.0.0.10/24, no shut, then ping 10.0.0.1",
    ]);
    setGrade(null);
    setHopIds([]);
    setStatus("Lab loaded");
    setDockTab("terminal");
    setInspectorTick((n) => n + 1);
  }, [engine]);

  const onAddDevice = useCallback((type: DeviceType) => {
    const id = `${type}-${Math.random().toString(36).slice(2, 7)}`;
    setNodes((prev) => [
      ...prev,
      {
        id,
        name: id.toUpperCase(),
        type,
        x: 80 + (prev.length % 5) * 110,
        y: 80 + Math.floor(prev.length / 5) * 90,
      },
    ]);
    setStatus("Palette place is visual-only in P0 — use Sample for the graded lab");
  }, []);

  const onSubmitLine = useCallback(
    (line: string) => {
      if (!selectedId) {
        setTermLines((prev) => [...prev, "Select a device on the canvas first."]);
        setTermInput("");
        return;
      }
      setTermLines((prev) => [...prev, `${termPrompt} ${line}`]);
      setTermInput("");
      const result = engine.executeCommand(selectedId, line);
      if (result.prompt) {
        setTermPromptByDevice((prev) => ({
          ...prev,
          [selectedId]: result.prompt,
        }));
      }
      if (result.error) setTermLines((prev) => [...prev, result.error!]);
      else if (result.output) setTermLines((prev) => [...prev, result.output]);
      const latest = engine.traces.at(-1);
      if (latest) setHopIds(latest.hops.map((h) => h.deviceId));
      setStatus("Command executed");
      setInspectorTick((n) => n + 1);
    },
    [engine, selectedId, termPrompt],
  );

  const onSave = useCallback(async () => {
    const snap = engine.snapshot();
    if (!snap) return;
    await saveWorkspace({
      id: WORKSPACE_ID,
      labId,
      title: labTitle,
      updatedAt: Date.now(),
      snapshotJson: JSON.stringify(snap),
      positionsJson: JSON.stringify(
        Object.fromEntries(nodes.map((n) => [n.id, { x: n.x, y: n.y }])),
      ),
      attemptsJson: JSON.stringify(grade ? [grade] : []),
    });
    setStatus("Saved to IndexedDB");
  }, [engine, grade, labId, labTitle, nodes]);

  const onRestore = useCallback(async () => {
    const record = await loadWorkspace(WORKSPACE_ID);
    if (!record) {
      setStatus("No saved workspace");
      return;
    }
    engine.restore(JSON.parse(record.snapshotJson));
    setLabTitle(record.title);
    setLabId(record.labId);
    const positions = JSON.parse(record.positionsJson) as Record<
      string,
      { x: number; y: number }
    >;
    const devices = engine.getController()?.getDevices() ?? [];
    setNodes(
      devices.map((d) => ({
        id: d.id,
        name: d.name,
        type: d.type,
        x: positions[d.id]?.x ?? 100,
        y: positions[d.id]?.y ?? 100,
      })),
    );
    const linkRows = engine.getController()?.getLinks() ?? [];
    setLinks(
      linkRows.map((l) => ({
        id: l.id,
        aDeviceId: l.a.deviceId,
        bDeviceId: l.b.deviceId,
      })),
    );
    setStatus("Restored from IndexedDB");
    setInspectorTick((n) => n + 1);
  }, [engine]);

  const onSubmitLab = useCallback(() => {
    const sim = engine.getController();
    if (!sim || labId !== BASIC_LAN_LAB.id) {
      setStatus("Load the Basic LAN sample before submit");
      setDockTab("score");
      return;
    }
    const report = gradeLab(BASIC_LAN_LAB, sim);
    setGrade(report);
    setDockTab("score");
    setStatus(report.passed ? `Passed · ${report.score}%` : `Score ${report.score}%`);
    const pingTrace = engine.traces.filter((t) => t.protocol === "ICMP").at(-1);
    if (pingTrace) setHopIds(pingTrace.hops.map((h) => h.deviceId));
    void saveWorkspace({
      id: WORKSPACE_ID,
      labId,
      title: labTitle,
      updatedAt: Date.now(),
      snapshotJson: JSON.stringify(sim.snapshot()),
      positionsJson: JSON.stringify(
        Object.fromEntries(nodes.map((n) => [n.id, { x: n.x, y: n.y }])),
      ),
      attemptsJson: JSON.stringify([report]),
    });
  }, [engine, labId, labTitle, nodes]);

  const packetItems = engine.traces.map((t) => ({
    id: t.packetId,
    t: t.hops[0]?.t ?? 0,
    summary: t.summary,
    protocol: t.protocol,
  }));

  const eventItems = engine.events.map((e) => ({
    id: e.id,
    t: e.t,
    type: e.type,
    detail: e.deviceId
      ? `${e.deviceId} ${JSON.stringify(e.data)}`
      : JSON.stringify(e.data),
  }));

  return (
    <div className="sim-workspace flex h-[calc(100dvh-3.5rem)] flex-col md:h-dvh">
      <SimTopBar
        labTitle={labTitle}
        statusLabel={status}
        onLoadSample={loadBasicLan}
        onSave={() => void onSave()}
        onRestore={() => void onRestore()}
        onSubmit={onSubmitLab}
      />

      <div className="flex min-h-0 flex-1">
        <DevicePalette onAddDevice={onAddDevice} />
        <div className="min-w-0 flex-1 border-x border-border">
          <TopologyCanvas
            nodes={nodes}
            links={links}
            selectedId={selectedId}
            onSelect={onSelectDevice}
            hopDeviceIds={hopIds}
          />
        </div>
        <InspectorPanel selection={inspector} />
      </div>

      <BottomDock activeTab={dockTab} onTabChange={setDockTab}>
        {dockTab === "terminal" && (
          <TerminalPane
            lines={termLines}
            prompt={termPrompt}
            input={termInput}
            onInputChange={setTermInput}
            onSubmitLine={onSubmitLine}
            disabled={!selectedId}
          />
        )}
        {dockTab === "packets" && <PacketsPane packets={packetItems} />}
        {dockTab === "events" && <EventsPane events={eventItems} />}
        {dockTab === "capture" && (
          <StubPane
            title="Capture"
            description="Ring-buffer capture and PCAP export arrive in P1."
          />
        )}
        {dockTab === "score" && (
          <ScorePane
            score={grade?.score}
            passScore={grade?.passScore}
            checks={grade?.checks.map((c) => ({
              id: c.id,
              label: c.label,
              pass: c.pass,
              detail: c.detail,
            }))}
            message="Load Sample → configure → Submit"
          />
        )}
        {dockTab === "tutor" && (
          <StubPane
            title="AI Tutor"
            description="Structured root-cause tutoring ships after the packet/VLAN slice."
          />
        )}
      </BottomDock>
    </div>
  );
}
