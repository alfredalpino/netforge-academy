import { test, expect } from "@playwright/test";
import {
  configureDevice,
  submitLabAndExpectPerfectScore,
} from "./simulator-helpers";

test.describe("Simulator dhcp-basic lab", () => {
  test("configures DHCP pool and PC learns address via DORA", async ({ page }) => {
    test.setTimeout(90_000);

    await page.goto("/simulator?lab=dhcp-basic");
    await expect(page.getByTestId("simulator-page")).toBeVisible();
    await expect(page.getByText("DHCP Address Assignment", { exact: true })).toBeVisible();
    await page.getByTestId("device-node-R1").waitFor({ state: "visible" });

    await configureDevice(page, "R1", [
      "interface Gi0/0",
      "ip address 192.168.1.1 255.255.255.0",
      "no shutdown",
      "exit",
      "ip dhcp pool LAN",
      "network 192.168.1.0 255.255.255.0",
      "default-router 192.168.1.1",
    ]);

    await configureDevice(page, "PC1", [
      "interface eth0",
      "no shutdown",
      "ip address dhcp",
    ]);

    // Allow DORA exchange to complete before grading
    await page.waitForTimeout(2_000);

    await submitLabAndExpectPerfectScore(page);
    await expect(page.locator("#score-check-c3").getByText("PASS")).toBeVisible();
  });
});
