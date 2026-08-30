import { test, expect } from "@playwright/test";
import {
  configureDevice,
  submitLabAndExpectPerfectScore,
} from "./simulator-helpers";

test.describe("Simulator nat-basic lab", () => {
  test("configures PAT overload and passes grading", async ({ page }) => {
    test.setTimeout(90_000);

    await page.goto("/simulator?lab=nat-basic");
    await expect(page.getByTestId("simulator-page")).toBeVisible();
    await expect(page.getByText("NAT PAT Overload", { exact: true })).toBeVisible();
    await page.getByTestId("device-node-R1").waitFor({ state: "visible" });

    await configureDevice(page, "R1", [
      "interface Gi0/0",
      "ip address 192.168.1.1 255.255.255.0",
      "ip nat inside",
      "no shutdown",
      "exit",
      "interface Gi0/1",
      "ip address 10.0.0.1 255.255.255.252",
      "ip nat outside",
      "no shutdown",
      "exit",
      "access-list 1 permit 192.168.1.0 0.0.0.255",
      "ip nat inside source list 1 interface Gi0/1 overload",
    ]);

    await configureDevice(page, "PC1", [
      "interface eth0",
      "ip address 192.168.1.10 255.255.255.0",
      "no shutdown",
      "exit",
      "ip default-gateway 192.168.1.1",
    ]);

    await configureDevice(page, "Server", [
      "interface eth0",
      "ip address 10.0.0.2 255.255.255.252",
      "no shutdown",
    ]);

    await submitLabAndExpectPerfectScore(page);
    await expect(page.locator("#score-check-c4").getByText("PASS")).toBeVisible();
  });
});
