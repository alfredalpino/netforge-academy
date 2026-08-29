"use client";

import { useCallback, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { SimTopBar } from "@/features/simulator/chrome/SimTopBar";
import { DevicePalette } from "@/features/simulator/palette/DevicePalette";
import { TopologyCanvas } from "@/features/simulator/canvas/TopologyCanvas";
import {
  InspectorPanel,
  type InspectorSelection,
} from "@/features/simulator/inspector/InspectorPanel";
import { BottomDock } from "@/features/simulator/dock/BottomDock";
import { TerminalPane } from "@/features/simulator/dock/TerminalPane";
import { PacketsPane } from "@/features/simulator/dock/PacketsPane";
import { EventsPane } from "@/features/simulator/dock/EventsPane";
import { ScorePane } from "@/features/simulator/dock/ScorePane";
import { StubPane } from "@/features/simulator/dock/StubPane";
import { useSimulationEngine } from "@/features/simulator/hooks/useSimulationEngine";
import { useSimulatorStore } from "@/features/simulator/store/simulatorStore";
import { BASIC_LAN_LAB } from "@/content/labs/basic-lan";
import { VLAN_SEGMENT_LAB } from "@/content/labs/vlan-segment";
import { topologyFromLab } from "@/simulation/grading/lab-schema";
import {
  saveWorkspace,
  loadWorkspace,
} from "@/features/simulator/persistence/sim-idb";
import type { DeviceType } from "@/simulation/core/types";
import type { LabSpec } from "@/simulation/grading/lab-schema";

const WORKSPACE_ID = "default";

const CATALOG: Record<string, LabSpec> = {
  "basic-lan": BASIC_LAN_LAB,
  "vlan-segment": VLAN_SEGMENT_LAB,
};

export function SimulatorShell() {
  const engine = useSimulationEngine();
  const search = useSearchParams();
  const store = useSimulatorStore();

  const selectedDevice = store.selectedId
    ? store.devices.find((d) => d.id === store.selectedId)
    : undefined;

  const termPrompt = store.selectedId
    ? (store.termPromptByDevice[store.selectedId] ??
      `${selectedDevice?.hostname || selectedDevice?.name || store.selectedId}>`)
    : "netforge>";

  const hopIds = useMemo(() => {
    if (!store.selectedPacketId) {
      const last = store.traces.at(-1);
      return last?.hops.map((h) => h.deviceId) ?? [];
    }
    const tr = store.traces.find((t) => t.packetId === store.selectedPacketId);
    return tr?.hops.map((h) => h.deviceId) ?? [];
  }, [store.selectedPacketId, store.traces]);

  const inspector: InspectorSelection = useMemo(() => {
    if (!selectedDevice) return { kind: "none" };
    return {
      kind: "device",
      id: selectedDevice.id,
      title: selectedDevice.name,
      subtitle: `${selectedDevice.type} · ${selectedDevice.os} · NetForge`,
      rows: [
        { label: "Hostname", value: selectedDevice.hostname },
        { label: "Vendor", value: selectedDevice.vendor },
        { label: "ARP", value: String(selectedDevice.runtime.arpTable.length) },
        {
          label: "MAC",
          value: String(selectedDevice.runtime.macTable.length),
        },
        ...selectedDevice.interfaces.map((i) => ({
          label: i.name,
          value: `${i.ipv4[0]?.address ?? "—"} · ${i.adminStatus}/${i.operationalStatus}${
            i.switchport
              ? ` · ${i.switchport.mode} vlan${i.switchport.accessVlan}`
              : ""
          }`,
        })),
      ],
    };
  }, [selectedDevice]);

  const loadLab = useCallback(
    async (lab: LabSpec) => {
      const topo = topologyFromLab(lab);
      await engine.loadTopology(topo, 42);
      engine.applyLabStartup(lab);
      store.setLabMeta(lab.id, lab.title);
      store.setPositions(
        Object.fromEntries(
          lab.topology.nodes.map((n) => [
            n.id,
            n.position ?? { x: 100, y: 100 },
          ]),
        ),
      );
      store.setSelectedId(lab.topology.nodes[0]?.id ?? null);
      store.setTermLines([
        `Loaded: ${lab.title}`,
        ...lab.objectives.map((o) => `• ${o}`),
      ]);
      store.setGrade(null);
      store.setDockTab("terminal");
      store.setStatus(`Lab · ${lab.id}`);
    },
    [engine, store],
  );

  useEffect(() => {
    const labParam = search.get("lab");
    if (labParam && CATALOG[labParam]) {
      void loadLab(CATALOG[labParam]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- deep-link once on mount
  }, []);

  const onAddDevice = useCallback(
    async (type: DeviceType) => {
      const device = await engine.addDevice(type);
      const count = store.devices.length;
      store.patchPosition(device.id, {
        x: 80 + (count % 4) * 160,
        y: 80 + Math.floor(count / 4) * 120,
      });
      store.setSelectedId(device.id);
      store.setStatus(`Added ${device.name}`);
    },
    [engine, store],
  );

  const onConnectDevices = useCallback(
    async (
      a: { deviceId: string; interfaceName: string },
      b: { deviceId: string; interfaceName: string },
    ) => {
      try {
        await engine.addLink(a, b);
        store.setStatus(`Linked ${a.deviceId}:${a.interfaceName} ↔ ${b.deviceId}:${b.interfaceName}`);
      } catch (e) {
        store.setStatus(e instanceof Error ? e.message : "Link failed");
      }
    },
    [engine, store],
  );

  const onSubmitLine = useCallback(
    async (line: string) => {
      if (!store.selectedId) {
        store.appendTerm("Select a device on the canvas first.");
        return;
      }
      const result = await engine.executeCommand(store.selectedId, line);
      if (result.prompt) store.setTermPrompt(store.selectedId, result.prompt);
      if (result.error) store.appendTerm(result.error);
      else if (result.output) {
        for (const row of result.output.split("\n")) store.appendTerm(row);
      }
      store.setStatus("Command executed");
    },
    [engine, store],
  );

  const onSave = useCallback(async () => {
    const snap = await engine.snapshot();
    await saveWorkspace({
      id: WORKSPACE_ID,
      labId: store.labId,
      title: store.labTitle,
      updatedAt: Date.now(),
      snapshotJson: JSON.stringify(snap),
      positionsJson: JSON.stringify(store.positions),
      attemptsJson: JSON.stringify(store.grade ? [store.grade] : []),
    });
    store.setStatus("Saved to IndexedDB");
  }, [engine, store]);

  const onRestore = useCallback(async () => {
    const record = await loadWorkspace(WORKSPACE_ID);
    if (!record) {
      store.setStatus("No saved workspace");
      return;
    }
    await engine.restore(JSON.parse(record.snapshotJson));
    store.setLabMeta(record.labId, record.title);
    store.setPositions(JSON.parse(record.positionsJson));
    store.setStatus("Restored from IndexedDB");
  }, [engine, store]);

  const onSubmitLab = useCallback(async () => {
    const lab = store.labId ? CATALOG[store.labId] : null;
    if (!lab) {
      store.setStatus("Load a catalog lab before submit");
      store.setDockTab("score");
      return;
    }
    const report = await engine.grade(lab);
    store.setGrade(report);
    store.setDockTab("score");
    store.setStatus(
      report.passed ? `Passed · ${report.score}%` : `Score ${report.score}%`,
    );
  }, [engine, store]);

  const selectedPacket = store.traces.find(
    (t) => t.packetId === store.selectedPacketId,
  );

  return (
    <div className="sim-workspace flex h-[calc(100dvh-3.5rem)] flex-col md:h-dvh">
      <SimTopBar
        labTitle={store.labTitle}
        statusLabel={`${store.status} · DES main`}
        onLoadSample={() => void loadLab(BASIC_LAN_LAB)}
        onSave={() => void onSave()}
        onRestore={() => void onRestore()}
        onSubmit={() => void onSubmitLab()}
      />
      <p className="border-b border-border bg-surface/80 px-3 py-1 text-[0.65rem] text-muted">
        NetForgeOS — educational Cisco-style CLI. Not affiliated with Cisco or Fortinet.
        Icons: containerlab (BSD-3) / containerlab-app (MIT).{" "}
        <button
          type="button"
          className="text-accent underline-offset-2 hover:underline"
          onClick={() => void loadLab(VLAN_SEGMENT_LAB)}
        >
          Load VLAN lab
        </button>
      </p>

      <div className="flex min-h-0 flex-1">
        <DevicePalette onAddDevice={(t) => void onAddDevice(t)} />
        <div className="relative min-w-0 flex-1 border-x border-border">
          <TopologyCanvas
            devices={store.devices}
            links={store.links}
            positions={store.positions}
            selectedId={store.selectedId}
            hopDeviceIds={hopIds}
            onSelect={store.setSelectedId}
            onPositionsChange={store.setPositions}
            onConnectDevices={(a, b) => void onConnectDevices(a, b)}
          />
        </div>
        <InspectorPanel selection={inspector} />
      </div>

      <BottomDock activeTab={store.dockTab} onTabChange={store.setDockTab}>
        {store.dockTab === "terminal" && (
          <TerminalPane
            lines={store.termLines}
            prompt={termPrompt}
            onSubmitLine={(line) => void onSubmitLine(line)}
            disabled={!store.selectedId}
            resetKey={store.labId ?? "none"}
          />
        )}
        {store.dockTab === "packets" && (
          <div className="grid h-full min-h-0 grid-cols-1 md:grid-cols-2">
            <PacketsPane
              packets={store.traces.map((t) => ({
                id: t.packetId,
                t: t.hops[0]?.t ?? 0,
                summary: t.summary,
                protocol: t.protocol,
              }))}
              selectedId={store.selectedPacketId}
              onSelect={store.setSelectedPacketId}
            />
            <div className="overflow-y-auto border-l border-border p-3 font-mono text-[0.75rem]">
              {selectedPacket ? (
                <>
                  <p className="text-accent">{selectedPacket.protocol}</p>
                  <p className="mt-1 text-foreground">{selectedPacket.summary}</p>
                  <p className="mt-2 text-muted">Outcome: {selectedPacket.outcome}</p>
                  <ol className="mt-3 list-decimal space-y-1 pl-4 text-muted">
                    {selectedPacket.hops.map((h, i) => (
                      <li key={`${h.t}-${i}`}>
                        t={h.t.toFixed(2)} {h.deviceId}: {h.action}
                      </li>
                    ))}
                  </ol>
                </>
              ) : (
                <p className="text-muted">Select a packet to inspect hops.</p>
              )}
            </div>
          </div>
        )}
        {store.dockTab === "events" && (
          <EventsPane
            events={store.events.map((e) => ({
              id: e.id,
              t: e.t,
              type: e.type,
              detail: e.deviceId
                ? `${e.deviceId} ${JSON.stringify(e.data)}`
                : JSON.stringify(e.data),
            }))}
          />
        )}
        {store.dockTab === "capture" && (
          <StubPane
            title="Capture buffer"
            description="Live traces feed Packets tab now; PCAP export is next."
          />
        )}
        {store.dockTab === "score" && (
          <ScorePane
            score={store.grade?.score}
            passScore={store.grade?.passScore}
            checks={store.grade?.checks.map((c) => ({
              id: c.id,
              label: c.label,
              pass: c.pass,
              detail: c.detail,
            }))}
          />
        )}
        {store.dockTab === "tutor" && (
          <StubPane
            title="Tutor"
            description="Structured root-cause from check evidence lands after VLAN polish — no LLM yet."
          />
        )}
      </BottomDock>
    </div>
  );
}
