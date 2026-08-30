import { test, expect } from "@playwright/test";
import {
  configureDevice,
  submitLabAndExpectPerfectScore,
} from "./simulator-helpers";

test.describe("Simulator ospf-basic lab", () => {
  test("forms OSPF adjacency and passes end-to-end ping grading", async ({ page }) => {
    test.setTimeout(90_000);

    await page.goto("/simulator?lab=ospf-basic");
    await expect(page.getByTestId("simulator-page")).toBeVisible();
    await expect(page.getByText("OSPF Single-Area Routing", { exact: true })).toBeVisible();
    await page.getByTestId("device-node-R1").waitFor({ state: "visible" });

    await configureDevice(page, "R1", [
      "interface Gi0/0",
      "ip address 192.168.1.1 255.255.255.0",
      "no shutdown",
      "exit",
      "interface Gi0/1",
      "ip address 10.0.0.1 255.255.255.252",
      "no shutdown",
      "exit",
      "router ospf 1",
      "router-id 1.1.1.1",
      "network 192.168.1.0 0.0.0.255 area 0",
      "network 10.0.0.0 0.0.0.3 area 0",
    ]);

    await configureDevice(page, "R2", [
      "interface Gi0/0",
      "ip address 10.0.0.2 255.255.255.252",
      "no shutdown",
      "exit",
      "interface Gi0/1",
      "ip address 192.168.2.1 255.255.255.0",
      "no shutdown",
      "exit",
      "router ospf 1",
      "router-id 2.2.2.2",
      "network 192.168.2.0 0.0.0.255 area 0",
      "network 10.0.0.0 0.0.0.3 area 0",
    ]);

    await configureDevice(page, "PC1", [
      "interface eth0",
      "ip address 192.168.1.10 255.255.255.0",
      "no shutdown",
      "exit",
      "ip default-gateway 192.168.1.1",
    ]);

    await configureDevice(page, "PC2", [
      "interface eth0",
      "ip address 192.168.2.10 255.255.255.0",
      "no shutdown",
      "exit",
      "ip default-gateway 192.168.2.1",
    ]);

    // Allow OSPF hello/dead timers to form FULL adjacency
    await page.waitForTimeout(3_000);

    await submitLabAndExpectPerfectScore(page);
    await expect(page.locator("#score-check-c6").getByText("PASS")).toBeVisible();
  });
});
