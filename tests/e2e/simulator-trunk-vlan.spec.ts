import { test, expect } from "@playwright/test";
import {
  configureDevice,
  submitLabAndExpectPerfectScore,
} from "./simulator-helpers";

const trunkSwitchConfig = [
  "interface Gi0/1",
  "switchport mode access",
  "switchport access vlan 10",
  "no shutdown",
  "exit",
  "interface Gi0/2",
  "switchport mode trunk",
  "switchport trunk allowed vlan 10",
  "no shutdown",
];

test.describe("Simulator trunk-vlan lab", () => {
  test("configures VLAN 10 access and trunk between switches", async ({ page }) => {
    test.setTimeout(90_000);

    await page.goto("/simulator?lab=trunk-vlan");
    await expect(page.getByTestId("simulator-page")).toBeVisible();
    await expect(page.getByText("802.1Q Trunk Between Switches", { exact: true })).toBeVisible();
    await page.getByTestId("device-node-SW1").waitFor({ state: "visible" });

    await configureDevice(page, "SW1", trunkSwitchConfig);
    await configureDevice(page, "SW2", trunkSwitchConfig);

    await configureDevice(page, "PC1", [
      "interface eth0",
      "ip address 192.168.10.10 255.255.255.0",
      "no shutdown",
    ]);

    await configureDevice(page, "PC2", [
      "interface eth0",
      "ip address 192.168.10.20 255.255.255.0",
      "no shutdown",
    ]);

    await submitLabAndExpectPerfectScore(page);
    await expect(page.locator("#score-check-c4").getByText("PASS")).toBeVisible();
  });
});
