import { type Page, expect } from "@playwright/test";

/** Programmatic device selection — avoids canvas hit-testing flakiness in Playwright. */
export async function selectDevice(page: Page, deviceId: string) {
  const inspector = page.getByRole("complementary", { name: "Inspector" });
  const title = inspector.locator("p.font-display");

  await page.evaluate((id) => {
    window.dispatchEvent(new CustomEvent("simulator:select-device", { detail: { id } }));
  }, deviceId);

  await expect(title).toHaveText(deviceId, { timeout: 5_000 });
}

export async function runCli(page: Page, line: string) {
  const terminal = page.locator(".sim-terminal");
  await terminal.click();
  await page.keyboard.type(line);
  await page.keyboard.press("Enter");
  await page.waitForTimeout(150);
}

export async function configureDevice(page: Page, deviceId: string, lines: string[]) {
  await selectDevice(page, deviceId);
  await runCli(page, "enable");
  await runCli(page, "configure terminal");
  for (const line of lines) {
    await runCli(page, line);
  }
  await runCli(page, "end");
}

export async function submitLabAndExpectPerfectScore(page: Page) {
  await page.getByRole("button", { name: "Submit" }).click();
  await expect(page.getByRole("tab", { name: "Score" })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tabpanel").getByText("100%", { exact: true })).toBeVisible({
    timeout: 15_000,
  });
}
