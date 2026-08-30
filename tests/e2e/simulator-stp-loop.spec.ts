import { test, expect } from "@playwright/test";
import {
  configureDevice,
  submitLabAndExpectPerfectScore,
} from "./simulator-helpers";

test.describe("Simulator stp-loop lab", () => {
  test("addresses PCs and pings across STP tree", async ({ page }) => {
    test.setTimeout(60_000);

    await page.goto("/simulator?lab=stp-loop");
    await expect(page.getByTestId("simulator-page")).toBeVisible();
    await expect(page.getByText("Spanning Tree Loop Prevention", { exact: true })).toBeVisible();
    await page.getByTestId("device-node-PC1").waitFor({ state: "visible" });

    await configureDevice(page, "PC1", [
      "interface eth0",
      "ip address 192.168.1.10 255.255.255.0",
      "no shutdown",
    ]);

    await configureDevice(page, "PC2", [
      "interface eth0",
      "ip address 192.168.1.20 255.255.255.0",
      "no shutdown",
    ]);

    await submitLabAndExpectPerfectScore(page);
    await expect(page.locator("#score-check-c4").getByText("PASS")).toBeVisible();
  });
});
