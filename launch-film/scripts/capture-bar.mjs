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
  defaultViewport: { width: 1920, height: 1080, deviceScaleFactor: 3 },
  args: ["--no-sandbox", "--hide-scrollbars", "--force-color-profile=srgb"],
});
const page = await browser.newPage();
page.setDefaultTimeout(45000);
await page.goto(BASE, { waitUntil: "networkidle2" });
await page.waitForSelector('input[aria-label="Search birds by color or name"]');
await sleep(1500);

const handle = await page.evaluateHandle(() => {
  const input = document.querySelector('input[aria-label="Search birds by color or name"]');
  return input?.closest("div.h-12") || input?.parentElement;
});
const el = handle.asElement();
const box = await el.boundingBox();
const pad = 10;
await page.screenshot({
  path: resolve(outDir, "search-bar-empty.png"),
  clip: {
    x: Math.max(0, box.x - pad),
    y: Math.max(0, box.y - pad),
    width: box.width + pad * 2,
    height: box.height + pad * 2,
  },
});
console.log("search-bar-empty.png", Math.round(box.width) + "x" + Math.round(box.height));
await browser.close();
