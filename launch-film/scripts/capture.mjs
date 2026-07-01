/**
 * Captures the real Bird Palette UI from the running dev server (localhost:3000)
 * into public/product/ for use in the launch film. Uses the chrome-headless-shell
 * that Remotion already downloaded, driven by puppeteer-core.
 *
 * Run:  node scripts/capture.mjs
 */
import puppeteer from "puppeteer-core";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { mkdirSync, readdirSync } from "node:fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const outDir = resolve(root, "public/product");
mkdirSync(outDir, { recursive: true });

const BASE = process.env.BASE_URL || "http://localhost:3000";

function findChrome() {
  const base = resolve(root, "node_modules/.remotion/chrome-headless-shell");
  const platforms = readdirSync(base);
  for (const p of platforms) {
    try {
      const inner = resolve(base, p);
      const sub = readdirSync(inner).find((d) => d.startsWith("chrome-headless-shell"));
      if (sub) {
        const bin = resolve(inner, sub, "chrome-headless-shell");
        return bin;
      }
    } catch {
      /* keep looking */
    }
  }
  throw new Error("chrome-headless-shell not found; run a render once to download it.");
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function hideNextDevBadge(page) {
  await page.evaluate(() => {
    document.querySelectorAll("nextjs-portal").forEach((el) => {
      el.style.display = "none";
    });
  });
  await page.addStyleTag({ content: "nextjs-portal { display: none !important; }" });
}

async function main() {
  const executablePath = findChrome();
  console.log("Chrome:", executablePath);

  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    defaultViewport: { width: 1920, height: 1080, deviceScaleFactor: 2 },
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--hide-scrollbars", "--force-color-profile=srgb"],
  });

  const page = await browser.newPage();
  page.setDefaultTimeout(45000);

  // --- Homepage ---
  console.log("Loading homepage...");
  await page.goto(BASE, { waitUntil: "networkidle2" });
  await page.waitForSelector(".grid button", { timeout: 45000 });
  await sleep(2500); // let remote bird images settle
  await hideNextDevBadge(page);

  await page.screenshot({ path: resolve(outDir, "homepage-top.png") });
  console.log("  homepage-top.png");

  await page.screenshot({ path: resolve(outDir, "homepage-tall.png"), fullPage: true });
  console.log("  homepage-tall.png");

  // --- Color circle (the conic-gradient trigger in the search bar) ---
  const trigger = await page.$("[data-color-trigger]");
  if (trigger) {
    const box = await trigger.boundingBox();
    if (box) {
      const pad = 6;
      await page.screenshot({
        path: resolve(outDir, "color-circle.png"),
        clip: {
          x: Math.max(0, box.x - pad),
          y: Math.max(0, box.y - pad),
          width: box.width + pad * 2,
          height: box.height + pad * 2,
        },
      });
      console.log("  color-circle.png");
    }
    // Open the square picker sheet and capture it.
    await trigger.click();
    await sleep(700);
    const picker = await page.$(".fixed.inset-x-0.bottom-5 .rounded-2xl");
    if (picker) {
      const pbox = await picker.boundingBox();
      if (pbox) {
        const pad = 4;
        await page.screenshot({
          path: resolve(outDir, "color-picker.png"),
          clip: {
            x: Math.max(0, pbox.x - pad),
            y: Math.max(0, pbox.y - pad),
            width: pbox.width + pad * 2,
            height: pbox.height + pad * 2,
          },
        });
        console.log("  color-picker.png");
      }
    }
    await page.screenshot({ path: resolve(outDir, "picker-open.png") });
    console.log("  picker-open.png");
    // Close picker.
    await page.keyboard.press("Escape");
    await sleep(400);
  }

  // --- Search 'orange' ---
  console.log("Searching 'orange'...");
  const input = await page.$('input[aria-label="Search birds by color or name"]');
  if (input) {
    await input.click();
    await page.keyboard.type("orange", { delay: 40 });
    // Filtering loads the search index; wait for results to settle.
    await sleep(3500);
    await page.screenshot({ path: resolve(outDir, "search-orange.png") });
    console.log("  search-orange.png");
    // Clear for a clean state.
    await page.evaluate(() => window.scrollTo(0, 0));
  }

  // --- Bird detail modal ---
  console.log("Opening a bird...");
  // Reset search so the grid shows browseable birds again.
  await page.goto(BASE, { waitUntil: "networkidle2" });
  await page.waitForSelector(".grid button", { timeout: 45000 });
  await sleep(2500);
  await page.evaluate(() => {
    document.querySelectorAll("nextjs-portal").forEach((el) => {
      el.style.display = "none";
    });
  });
  await page.addStyleTag({ content: "nextjs-portal { display: none !important; }" });
  const firstBird = await page.$(".grid button");
  if (firstBird) {
    await firstBird.click();
    await sleep(3000); // modal open + image load
    await page.screenshot({ path: resolve(outDir, "bird-detail.png") });
    console.log("  bird-detail.png");
  }

  await browser.close();
  console.log("Done. Files in", outDir);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
