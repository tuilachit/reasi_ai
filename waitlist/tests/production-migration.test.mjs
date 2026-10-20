import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

test("both deployment configs use Next without Vite's catch-all rewrite", () => {
  for (const file of ["../vercel.json", "../../vercel.json"]) {
    const config = JSON.parse(readFileSync(new URL(file, import.meta.url), "utf8"));
    assert.equal(config.framework, "nextjs");
    assert.notEqual(config.outputDirectory, "dist");
    assert.ok(!config.rewrites?.some(rule => rule.destination === "/index.html"));
  }
});

const base = process.env.SITE_URL;
test("the homepage footer omits the personal email and preserves service links", { skip: !base }, async () => {
  const response = await fetch(base);
  assert.equal(response.status, 200);
  const html = (await response.text()).replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, "");
  const footer = html.match(/<footer\b[^>]*class="site-footer wrap"[^>]*>([\s\S]*?)<\/footer>/)?.[1];
  assert.ok(footer, "homepage footer renders without JavaScript");
  assert.doesNotMatch(footer, /luke@reasiai\.com/);
  for (const route of ["/privacy", "/terms", "/support"]) {
    assert.ok(footer.includes(`href="${route}"`), `${route} remains discoverable`);
  }
});
