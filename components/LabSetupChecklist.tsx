"use client";

import { useProgress } from "@/lib/progress";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { PageSkeleton } from "@/components/ui/Skeleton";

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

  if (!loaded) return <PageSkeleton />;

  const totalItems = SETUP_STEPS.reduce((sum, s) => sum + s.items.length, 0);
  const completed = progress.labSetupComplete.length;

  return (
    <section>
      <ProgressBar
        value={completed}
        max={totalItems}
        label="Setup checklist"
        className="mb-6"
      />

      <div className="space-y-4">
        {SETUP_STEPS.map((step) => {
          const stepDone = step.items.filter((i) =>
            progress.labSetupComplete.includes(i.id)
          ).length;

          return (
            <Card key={step.id}>
              <div className="mb-3 flex items-center justify-between gap-2">
                <h3 className="font-medium">{step.title}</h3>
                <span className="text-xs text-muted">
                  {stepDone}/{step.items.length}
                </span>
              </div>
              <ul className="space-y-2">
                {step.items.map((item) => {
                  const done = progress.labSetupComplete.includes(item.id);
                  return (
                    <li key={item.id}>
                      <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border/40 bg-background/50 px-3 py-2.5 transition hover:bg-background">
                        <input
                          type="checkbox"
                          checked={done}
                          onChange={() => toggleLabSetup(item.id)}
                          className="mt-0.5 accent-success"
                        />
                        <span className={`text-sm ${done ? "text-muted line-through" : ""}`}>
                          {item.text}
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
