import { test, expect } from "@playwright/test";
import {
  configureDevice,
  submitLabAndExpectPerfectScore,
} from "./simulator-helpers";

test.describe("Simulator acl-standard lab", () => {
  test("blocks PC1 to PC2 but permits gateway ping", async ({ page }) => {
    test.setTimeout(90_000);

    await page.goto("/simulator?lab=acl-standard");
    await expect(page.getByTestId("simulator-page")).toBeVisible();
    await expect(page.getByText("Standard ACL Traffic Filter", { exact: true })).toBeVisible();
    await page.getByTestId("device-node-R1").waitFor({ state: "visible" });

    await configureDevice(page, "R1", [
      "interface Gi0/0",
      "ip address 192.168.1.1 255.255.255.0",
      "no shutdown",
      "exit",
      "interface Gi0/1",
      "ip address 192.168.2.1 255.255.255.0",
      "no shutdown",
      "exit",
      "access-list 10 deny 192.168.1.0 0.0.0.255",
      "interface Gi0/1",
      "ip access-group 10 out",
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

    await submitLabAndExpectPerfectScore(page);
    await expect(page.locator("#score-check-c5").getByText("PASS")).toBeVisible();
  });
});
