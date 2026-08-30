import { test, expect } from "@playwright/test";

function main(page: import("@playwright/test").Page) {
  return page.locator("#main-content");
}

test.describe("Academy smoke", () => {
  test("dashboard loads", async ({ page }) => {
    await page.goto("/");
    await expect(main(page).getByTestId("dashboard")).toBeVisible();
    await expect(
      main(page).getByRole("heading", { name: /Ready to study/i }),
    ).toBeVisible();
    await expect(main(page).getByRole("link", { name: /Start studying/i })).toBeVisible();
  });

  test("today page shows daily plan", async ({ page }) => {
    await page.goto("/today");
    await expect(main(page).getByTestId("today-page")).toBeVisible();
    await expect(main(page).getByRole("heading", { name: /Week \d+ · Day \d+/ })).toBeVisible();
  });

  test("today page keyboard shortcuts help opens", async ({ page }) => {
    await page.goto("/today");
    await expect(main(page).getByTestId("today-page")).toBeVisible();
    await page.getByTestId("today-shortcuts-trigger").click();
    await expect(page.getByTestId("today-shortcuts-help")).toBeVisible();
    await expect(page.getByText("Today — keyboard shortcuts")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByTestId("today-shortcuts-help")).not.toBeVisible();
  });

  test("topics index lists curated lectures", async ({ page }) => {
    await page.goto("/topics");
    await expect(main(page).getByRole("heading", { name: "Topic Videos" })).toBeVisible();
    await expect(main(page).getByText(/single-concept lectures plus/)).toBeVisible();
    await expect(main(page).getByTestId("full-courses")).toBeVisible();
    await expect(main(page).getByRole("link", { name: /Free CCNA 200-301 Practical Course/ })).toBeVisible();
  });

  test("course playlist page embeds first video", async ({ page }) => {
    await page.goto("/topics/courses/ccna-bombal");
    await expect(main(page).getByTestId("course-page")).toBeVisible();
    await expect(main(page).getByRole("heading", { name: /Free CCNA 200-301 Practical Course/ })).toBeVisible();
    const iframe = page.locator('[data-testid="youtube-embed"] iframe');
    await expect(iframe).toBeVisible();
    await expect(iframe).toHaveAttribute("src", /list=PLw6kwOJVj3MbMZ8B72ZgUryj8OSETC0ds/);
    await expect(main(page).getByTestId("course-episode-list")).toBeVisible();
  });

  test("topic page embeds YouTube video", async ({ page }) => {
    await page.goto("/topics/network-devices");
    await expect(main(page).getByRole("heading", { name: "Network Devices" })).toBeVisible();
    const iframe = page.locator('[data-testid="youtube-embed"] iframe');
    await expect(iframe).toBeVisible();
    await expect(iframe).toHaveAttribute(
      "src",
      /youtube-nocookie\.com\/embed\/H8W9oMNSuwo/,
    );
  });

  test("labs page lists browser simulator labs", async ({ page }) => {
    await page.goto("/labs");
    await expect(main(page).getByRole("heading", { name: "Lab Stack" })).toBeVisible();
    await expect(main(page).getByText("Basic LAN Connectivity")).toBeVisible();
    await expect(main(page).getByText(/\d+\/14 passed/)).toBeVisible();
  });

  test("simulator loads basic-lan lab with dock controls", async ({ page }) => {
    await page.goto("/simulator?lab=basic-lan");
    await expect(page.getByTestId("simulator-page")).toBeVisible();
    await expect(
      page.getByTestId("simulator-page").getByText("Basic LAN Connectivity", { exact: true }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Submit" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Save" })).toBeVisible();
  });

  test("navigation flow: dashboard → today → topics → labs → simulator", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("dashboard")).toBeVisible();

    await Promise.all([
      page.waitForURL(/\/today/, { timeout: 15_000 }),
      page.getByRole("link", { name: "Today", exact: true }).click(),
    ]);

    await Promise.all([
      page.waitForURL(/\/topics/, { timeout: 15_000 }),
      page.getByRole("link", { name: "Topic Videos" }).click(),
    ]);

    await Promise.all([
      page.waitForURL(/\/labs/, { timeout: 15_000 }),
      page.getByRole("link", { name: "Lab Stack" }).click(),
    ]);

    await Promise.all([
      page.waitForURL(/\/simulator/, { timeout: 15_000 }),
      page.getByRole("link", { name: "Open Simulator" }).first().click(),
    ]);
  });

  test("drills index shows drill types and stats", async ({ page }) => {
    await page.goto("/drills");
    await expect(main(page).getByTestId("drills-page")).toBeVisible();
    await expect(main(page).getByRole("heading", { name: "Drills" })).toBeVisible();
    await expect(main(page).getByRole("link", { name: /Subnetting/i })).toBeVisible();
    await expect(main(page).getByRole("link", { name: /VLSM Design/i })).toBeVisible();
    await expect(main(page).getByRole("link", { name: /Recall Flashcards/i })).toBeVisible();
  });

  test("accountability page shows weekly review section", async ({ page }) => {
    await page.goto("/accountability");
    await expect(main(page).getByTestId("accountability-page")).toBeVisible();
    await expect(main(page).getByTestId("weekly-review")).toBeVisible();
    await expect(main(page).getByText("Weekly Review")).toBeVisible();
    await expect(main(page).getByText(/Simulator labs passed/)).toBeVisible();
  });

  test("theme toggle switches light and dark mode", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("dashboard")).toBeVisible();
    const toggle = page.getByTestId("theme-toggle");
    await toggle.click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await toggle.click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  });

  test("gates page shows drill and lab CTAs", async ({ page }) => {
    await page.goto("/gates");
    await expect(main(page).getByTestId("gates-page")).toBeVisible();
    await expect(main(page).getByRole("heading", { name: "Certification Gates" })).toBeVisible();
    await expect(main(page).getByRole("link", { name: "Practice subnetting" }).first()).toBeVisible();
    await expect(main(page).getByRole("link", { name: "Practice VLSM" }).first()).toBeVisible();
    await expect(main(page).getByRole("link", { name: "Open lab stack" }).first()).toBeVisible();
  });

  test("vlsm drill page loads question form", async ({ page }) => {
    await page.goto("/drills/vlsm");
    await expect(main(page).getByTestId("vlsm-drill-page")).toBeVisible();
    await expect(main(page).getByRole("heading", { name: "VLSM Design" })).toBeVisible();
    await expect(main(page).getByRole("button", { name: "Check Answer" })).toBeVisible();
    await expect(main(page).getByTestId("drill-timer-start")).toBeVisible();
  });

  test("subnetting drill has timer controls examples and video", async ({ page }) => {
    await page.goto("/drills/subnetting");
    await expect(main(page).getByTestId("subnetting-drill-page")).toBeVisible();
    await expect(main(page).getByTestId("drill-timer")).toHaveAttribute("data-status", "idle");
    await expect(main(page).getByTestId("drill-timer-start")).toBeVisible();
    await expect(main(page).getByTestId("drill-examples-toggle")).toBeVisible();
    await expect(main(page).getByRole("link", { name: /Subnetting lecture/i })).toBeVisible();
    await main(page).getByTestId("drill-examples-toggle").click();
    await expect(main(page).getByTestId("drill-examples-content")).toBeVisible();
    await expect(main(page).getByText("Classic /24")).toBeVisible();
  });

  test("recall drill page loads flashcards", async ({ page }) => {
    await page.goto("/drills/recall");
    await expect(main(page).getByTestId("recall-drill-page")).toBeVisible();
    await expect(main(page).getByRole("heading", { name: "Recall Flashcards" })).toBeVisible();
    await expect(main(page).getByRole("button", { name: "Reveal" })).toBeVisible();
  });
});
