import { test, expect } from "@playwright/test";
import {
  configureDevice,
  submitLabAndExpectPerfectScore,
} from "./simulator-helpers";

test.describe("Simulator inter-vlan-svi lab", () => {
  test("routes between VLANs via L3 switch SVIs", async ({ page }) => {
    test.setTimeout(90_000);

    await page.goto("/simulator?lab=inter-vlan-svi");
    await expect(page.getByTestId("simulator-page")).toBeVisible();
    await expect(page.getByText("Inter-VLAN Routing (SVI)", { exact: true })).toBeVisible();
    await page.getByTestId("device-node-SW1").waitFor({ state: "visible" });

    await configureDevice(page, "SW1", [
      "interface Gi0/1",
      "switchport mode access",
      "switchport access vlan 10",
      "no shutdown",
      "exit",
      "interface Gi0/2",
      "switchport mode access",
      "switchport access vlan 20",
      "no shutdown",
      "exit",
      "interface Vlan10",
      "ip address 192.168.10.1 255.255.255.0",
      "no shutdown",
      "exit",
      "interface Vlan20",
      "ip address 192.168.20.1 255.255.255.0",
      "no shutdown",
      "exit",
      "ip routing",
    ]);

    await configureDevice(page, "PC1", [
      "interface eth0",
      "ip address 192.168.10.10 255.255.255.0",
      "no shutdown",
      "exit",
      "ip default-gateway 192.168.10.1",
    ]);

    await configureDevice(page, "PC2", [
      "interface eth0",
      "ip address 192.168.20.20 255.255.255.0",
      "no shutdown",
      "exit",
      "ip default-gateway 192.168.20.1",
    ]);

    await submitLabAndExpectPerfectScore(page);
    await expect(page.locator("#score-check-c5").getByText("PASS")).toBeVisible();
  });
});
