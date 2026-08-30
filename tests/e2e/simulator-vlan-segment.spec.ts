import { test, expect } from "@playwright/test";
import {
  configureDevice,
  submitLabAndExpectPerfectScore,
} from "./simulator-helpers";

test.describe("Simulator vlan-segment lab", () => {
  test("configures VLAN access ports and passes grading", async ({ page }) => {
    test.setTimeout(60_000);

    await page.goto("/simulator?lab=vlan-segment");
    await expect(page.getByTestId("simulator-page")).toBeVisible();
    await expect(page.getByText("VLAN Segmentation", { exact: true })).toBeVisible();
    await page.getByTestId("device-node-SW1").waitFor({ state: "visible" });

    await configureDevice(page, "SW1", [
      "interface Gi0/2",
      "switchport mode access",
      "switchport access vlan 10",
      "no shutdown",
      "exit",
      "interface Gi0/3",
      "switchport mode access",
      "switchport access vlan 20",
      "no shutdown",
      "exit",
      "interface Gi0/1",
      "switchport mode trunk",
      "switchport trunk allowed vlan 10,20",
      "no shutdown",
    ]);

    await configureDevice(page, "R1", [
      "interface Gi0/0",
      "ip address 10.10.10.1 255.255.255.0",
      "no shutdown",
    ]);

    await configureDevice(page, "PC1", [
      "interface eth0",
      "ip address 10.10.10.10 255.255.255.0",
      "no shutdown",
    ]);

    await submitLabAndExpectPerfectScore(page);
    await expect(page.locator("#score-check-c3").getByText("PASS")).toBeVisible();
  });
});
