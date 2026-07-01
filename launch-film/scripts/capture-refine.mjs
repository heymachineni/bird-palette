import puppeteer from "puppeteer-core";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { readdirSync } from "node:fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const outDir = resolve(root, "public/product");
const BASE = process.env.BASE_URL || "http://localhost:3000";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function findChrome() {
  const base = resolve(root, "node_modules/.remotion/chrome-headless-shell");
  for (const p of readdirSync(base)) {
    try {
      const inner = resolve(base, p);
      const sub = readdirSync(inner).find((d) => d.startsWith("chrome-headless-shell"));
      if (sub) return resolve(inner, sub, "chrome-headless-shell");
    } catch {}
  }
  throw new Error("chrome not found");
}

const browser = await puppeteer.launch({
  executablePath: findChrome(),
  headless: true,
  defaultViewport: { width: 1920, height: 1080, deviceScaleFactor: 2 },
  args: ["--no-sandbox", "--hide-scrollbars", "--force-color-profile=srgb"],
});
const page = await browser.newPage();
page.setDefaultTimeout(45000);
await page.goto(BASE, { waitUntil: "networkidle2" });
await page.waitForSelector(".grid button");
await sleep(2500);

// Hide Next.js dev indicator (top-left "N") in all captures.
await page.evaluate(() => {
  document.querySelectorAll("nextjs-portal").forEach((el) => {
    el.style.display = "none";
  });
});
await page.addStyleTag({ content: "nextjs-portal { display: none !important; }" });

// 1) Grid-only tall capture: hide the fixed search bar + bottom scrim so we can
//    overlay a persistent search surface in the film.
await page.evaluate(() => {
  const input = document.querySelector('input[aria-label="Search birds by color or name"]');
  const bar = input?.closest("div.fixed");
  if (bar) bar.style.display = "none";
  document.querySelectorAll("div.fixed.bottom-0").forEach((el) => {
    el.style.display = "none";
  });
});
await sleep(400);
await page.screenshot({ path: resolve(outDir, "homepage-tall.png"), fullPage: true });
console.log("homepage-tall.png (grid only)");

// 2) Search bar with placeholder — solid white fill, light gray border (matches product).
await page.evaluate(() => {
  const input = document.querySelector('input[aria-label="Search birds by color or name"]');
  const bar = input?.closest("div.fixed");
  if (bar) bar.style.display = "";
  if (input) {
    input.value = "";
    input.setAttribute("placeholder", "Search with any color");
  }
  document.querySelectorAll(".grid").forEach((el) => (el.style.display = "none"));
  document.querySelectorAll("div.fixed.bottom-0").forEach((el) => (el.style.display = "none"));
  document.body.style.background = "#FBFAF7";
  document.documentElement.style.background = "#FBFAF7";

  const pill = input?.closest(".h-12");
  if (pill) {
    pill.style.background = "hsl(40 33% 98%)";
    pill.style.backdropFilter = "none";
    pill.style.webkitBackdropFilter = "none";
  }
});
await sleep(400);
const handle = await page.evaluateHandle(() => {
  const input = document.querySelector('input[aria-label="Search birds by color or name"]');
  return input?.closest(".h-12") || input?.parentElement;
});
const el = handle.asElement();
const box = await el.boundingBox();
const pad = 2;
await page.screenshot({
  path: resolve(outDir, "search-bar-empty.png"),
  clip: {
    x: Math.max(0, box.x - pad),
    y: Math.max(0, box.y - pad),
    width: box.width + pad * 2,
    height: box.height + pad * 2,
  },
});
console.log("search-bar-empty.png (placeholder visible, solid fill)");

await browser.close();
