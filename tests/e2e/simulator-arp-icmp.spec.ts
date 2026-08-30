import { test, expect } from "@playwright/test";
import {
  configureDevice,
  submitLabAndExpectPerfectScore,
} from "./simulator-helpers";

test.describe("Simulator arp-icmp lab", () => {
  test("addresses hosts on same subnet and passes ping grading", async ({ page }) => {
    test.setTimeout(60_000);

    await page.goto("/simulator?lab=arp-icmp");
    await expect(page.getByTestId("simulator-page")).toBeVisible();
    await expect(page.getByText("ARP & ICMP (Host-to-Host)", { exact: true })).toBeVisible();
    await page.getByTestId("device-node-PC1").waitFor({ state: "visible" });

    await configureDevice(page, "PC1", [
      "interface eth0",
      "ip address 10.0.0.10 255.255.255.0",
      "no shutdown",
    ]);

    await configureDevice(page, "PC2", [
      "interface eth0",
      "ip address 10.0.0.20 255.255.255.0",
      "no shutdown",
    ]);

    await submitLabAndExpectPerfectScore(page);
    await expect(page.locator("#score-check-c4").getByText("PASS")).toBeVisible();
  });
});
