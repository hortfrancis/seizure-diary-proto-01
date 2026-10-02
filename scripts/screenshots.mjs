import { mkdir, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";
import { createServer } from "vite";

const root = fileURLToPath(new URL("../", import.meta.url));
const exportsRoot = path.join(root, "screenshots");

// Reserve a new directory atomically, including when two exports start together.
async function reserveExport() {
  await mkdir(exportsRoot, { recursive: true });
  const entries = await readdir(exportsRoot);
  let next =
    Math.max(0, ...entries.filter((name) => /^\d+$/.test(name)).map(Number)) +
    1;
  for (;;) {
    const directory = path.join(exportsRoot, String(next).padStart(3, "0"));
    try {
      await mkdir(directory);
      return directory;
    } catch (error) {
      if (error.code !== "EEXIST") throw error;
      next += 1;
    }
  }
}

const directory = await reserveExport();
const captures = [];
let server;
let browser;
try {
  // Own server and browser: never reuse either person's interactive diary.
  server = await createServer({
    root,
    server: { host: "127.0.0.1", port: 5175, strictPort: true, open: false },
  });
  await server.listen();
  browser = await chromium.launch({ channel: "chromium" });
  for (const viewport of [
    { name: "mobile", width: 390, height: 844 },
    { name: "desktop", width: 1280, height: 900 },
  ]) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      locale: "en-GB",
      timezoneId: "Europe/London",
      reducedMotion: "reduce",
      colorScheme: "light",
    });
    const page = await context.newPage();
    page.setDefaultTimeout(15_000);
    await page.clock.setFixedTime(new Date("2026-10-02T09:30:00+01:00"));
    await page.goto("http://127.0.0.1:5175/");
    await page
      .getByRole("heading", { name: "Your diary", exact: true })
      .waitFor();
    await page.evaluate(() => document.fonts.ready);
    async function capture(name) {
      const filename = `${viewport.name}-${name}.png`;
      await page.screenshot({
        path: path.join(directory, filename),
        fullPage: true,
        animations: "disabled",
      });
      captures.push(filename);
    }
    await capture("01-diary-empty");
    await page
      .getByRole("button", { name: "Add an event", exact: true })
      .click();
    await capture("02-add-event");
    await page
      .getByRole("radio", { name: "Woke up Start of your day" })
      .check();
    await page
      .getByLabel("Anything to add? Optional")
      .fill("Fictional example: woke up after a quiet night.");
    await page.getByRole("button", { name: "Change", exact: true }).click();
    await page.getByLabel("Event date and time").fill("2026-10-02T07:15");
    await capture("03-add-event-filled");
    await page.getByRole("button", { name: "Save event", exact: true }).click();
    await page
      .getByRole("heading", { name: "Your diary", exact: true })
      .waitFor();
    if ((await page.locator("time").innerText()) !== "07:15") {
      throw new Error("The edited event time was not saved correctly.");
    }
    await capture("04-diary-populated");
    await context.close();
  }
  await writeFile(
    path.join(directory, "manifest.json"),
    JSON.stringify(
      {
        status: "complete",
        exportedAt: new Date().toISOString(),
        fixtureTime: "2026-10-02T09:30:00+01:00",
        description:
          "Step 1 screens and useful form states; fictional data only. Full-page PNGs.",
        captures,
      },
      null,
      2,
    ) + "\n",
  );
  console.log(`Exported ${captures.length} screenshots to ${directory}`);
} catch (error) {
  await writeFile(
    path.join(directory, "FAILED.txt"),
    `${error.stack ?? error}\n`,
  );
  console.error(
    `Screenshot export failed. Partial files retained in ${directory}.`,
  );
  console.error(error);
  process.exitCode = 1;
} finally {
  await browser?.close();
  await server?.close();
}
