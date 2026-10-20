import test from "node:test";
import assert from "node:assert/strict";

const base = process.env.SITE_URL;
const html = base ? await fetch(base).then(response => {
  assert.equal(response.status, 200);
  return response.text();
}) : "";
// Test the served HTML, not source strings. This also covers the no-JavaScript page.
const rendered = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, "");

test("each navigation destination exists in the rendered page", { skip: !base }, () => {
  const nav = rendered.match(/<nav\b[^>]*aria-label="Main navigation"[^>]*>([\s\S]*?)<\/nav>/)?.[1];
  assert.ok(nav, "main navigation is present in server HTML");
  const targets = [...nav.matchAll(/href="#([^"]+)"/g)].map(match => match[1]);
  assert.ok(new Set(targets).size >= 6, "six useful section destinations");
  for (const target of targets) {
    assert.ok(rendered.includes(`id="${target}"`), `missing destination: ${target}`);
  }
});

test("the editorial page does not render the retired grocery catalogue", { skip: !base }, () => {
  assert.doesNotMatch(rendered, /product-card|basket-demo|Chobani|Brancourts|John West|Edgell/);
  const sources = [...rendered.matchAll(/<img\b[^>]*>/g)].map(([tag]) => {
    const src = tag.match(/\bsrc="([^"]+)"/)?.[1];
    if (!src) return "";
    const url = new URL(src.replaceAll("&amp;", "&"), base);
    return url.searchParams.get("url") || url.pathname;
  }).filter(src => src.startsWith("/lifestyle/"));
  assert.ok(new Set(sources).size >= 5,
    "five distinct lifestyle photographs are distributed through the page");
});

test("booking links and image descriptions remain usable without JavaScript", { skip: !base }, () => {
  const ctas = [...rendered.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)]
    .filter(([, , text]) => text.includes("Book a 15-minute call"));
  assert.ok(ctas.length >= 3);
  for (const [, href] of ctas) assert.equal(href, "mailto:luke@reasiai.com");
  for (const [tag] of rendered.matchAll(/<img\b[^>]*>/g)) assert.match(tag, /\balt="[^"]*"/);
  assert.match(rendered, /Clinics write the plan/);
  assert.match(rendered, /clinician approval/i);
});

test("the team section uses one real cofounder photo instead of placeholder cards", { skip: !base }, () => {
  const team = rendered.match(/<section\b[^>]*\bid="our-team"[^>]*>([\s\S]*?)<\/section>/)?.[1];
  assert.ok(team, "team section is present in server HTML");
  const images = [...team.matchAll(/<img\b[^>]*>/g)].map(([tag]) => tag);
  assert.equal(images.length, 1, "the team section must contain exactly one shared cofounder image");
  const image = images[0];
  const src = image.match(/\bsrc="([^"]+)"/)?.[1];
  assert.ok(src, "the cofounder image has a source");
  const url = new URL(src.replaceAll("&amp;", "&"), base);
  assert.equal(url.searchParams.get("url") || url.pathname, "/team/reasi-cofounders.jpg");
  const alt = image.match(/\balt="([^"]*)"/)?.[1]?.trim();
  assert.ok(alt && alt.split(/\s+/).length >= 4, "the cofounder photo has a descriptive, nonempty alternative");
  assert.doesNotMatch(alt, /^(?:image|photo|picture|reasi-cofounders\.jpg)$/i);
  assert.doesNotMatch(team, /Photo to come|\[Founder name\]/i, "retired founder placeholders are absent");
});
