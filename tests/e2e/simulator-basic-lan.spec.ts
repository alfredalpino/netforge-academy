import { test, expect } from "@playwright/test";
import {
  configureDevice,
  submitLabAndExpectPerfectScore,
} from "./simulator-helpers";

test.describe("Simulator lab interaction", () => {
  test("configures and passes basic-lan via terminal + submit", async ({ page }) => {
    await page.goto("/simulator?lab=basic-lan");
    await expect(page.getByTestId("simulator-page")).toBeVisible();
    await expect(page.getByText("Basic LAN Connectivity", { exact: true })).toBeVisible();

    await page.getByTestId("device-node-R1").waitFor({ state: "visible" });

    await configureDevice(page, "R1", [
      "interface Gi0/0",
      "ip address 10.0.0.1 255.255.255.0",
      "no shutdown",
    ]);

    await configureDevice(page, "PC1", [
      "interface eth0",
      "ip address 10.0.0.10 255.255.255.0",
      "no shutdown",
    ]);

    await submitLabAndExpectPerfectScore(page);
    await expect(page.locator("#score-check-c0").getByText("PASS")).toBeVisible();
  });
});
