"use client";

import { useProgress } from "@/lib/progress";

const SETUP_STEPS = [
  {
    id: "virtualization",
    title: "Virtualization",
    items: [
      { id: "vm-hypervisor", text: "Install VMware Fusion / VirtualBox / UTM on macOS" },
      { id: "vm-ubuntu", text: "Create Ubuntu 22.04+ VM with 2GB+ RAM" },
      { id: "vm-windows", text: "Create Windows 10/11 VM for dual-stack testing" },
      { id: "vm-network", text: "Configure host-only or custom virtual network" },
    ],
  },
  {
    id: "packet-analysis",
    title: "Packet Analysis",
    items: [
      { id: "pa-wireshark", text: "Install Wireshark on host machine" },
      { id: "pa-tcpdump", text: "Install tcpdump on Linux VM" },
      { id: "pa-filters", text: "Practice capture filters: arp, icmp, tcp.port==443" },
      { id: "pa-review", text: "Save and annotate captures for weekly review" },
    ],
  },
  {
    id: "cisco-labs",
    title: "Cisco Labs",
    items: [
      { id: "cisco-pt", text: "Download Cisco Packet Tracer (NetAcad account)" },
      { id: "cisco-topo", text: "Build Week 2 topology: 2 switches, 3 PCs" },
      { id: "cisco-eveng", text: "Progress to EVE-NG for IOSv/IOSvL2 when ready" },
      { id: "cisco-git", text: "Export configs to Git for version control" },
    ],
  },
  {
    id: "fortinet-azure",
    title: "Fortinet & Azure (Later Phases)",
    items: [
      { id: "fa-fortigate", text: "FortiGate VM trial for NSE 4 (Week 19)" },
      { id: "fa-azure", text: "Azure free account for AZ-104/AZ-700 labs" },
      { id: "fa-cli", text: "Azure CLI + PowerShell + Bicep tooling" },
      { id: "fa-training", text: "Fortinet Training Institute labs" },
    ],
  },
  {
    id: "automation",
    title: "Automation Stack",
    items: [
      { id: "auto-python", text: "Python 3.11+ with venv" },
      { id: "auto-vscode", text: "VS Code with Git integration" },
      { id: "auto-ansible", text: "Ansible for config management (Phase 6)" },
      { id: "auto-workflow", text: "Use this academy for daily structure only — labs run locally" },
    ],
  },
];

export function LabSetupChecklist() {
  const { progress, toggleLabSetup, loaded } = useProgress();

  if (!loaded) return null;

  const totalItems = SETUP_STEPS.reduce((sum, s) => sum + s.items.length, 0);
  const completed = progress.labSetupComplete.length;
  const pct = Math.round((completed / totalItems) * 100);

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-medium">Setup Checklist</h2>
        <span className="text-xs text-muted">
          {completed}/{totalItems} ({pct}%)
        </span>
      </div>
      <div className="mb-4 h-2 overflow-hidden rounded-full bg-border">
        <div
          className="h-full rounded-full bg-success transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="space-y-6">
        {SETUP_STEPS.map((step) => (
          <div
            key={step.id}
            className="rounded-xl border border-border bg-surface p-6"
          >
            <h3 className="font-medium">{step.title}</h3>
            <ul className="mt-3 space-y-2">
              {step.items.map((item) => {
                const done = progress.labSetupComplete.includes(item.id);
                return (
                  <li key={item.id} className="flex items-start gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={done}
                      onChange={() => toggleLabSetup(item.id)}
                      className="mt-1 accent-success"
                    />
                    <span className={done ? "text-muted line-through" : "text-muted"}>
                      {item.text}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
