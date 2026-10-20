import { chromium, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";

const base = process.env.SITE_URL || "http://localhost:3017";
const lifestylePhotos = [
  "home-cooking.jpg",
  "shared-table.jpg",
  "coastal-walk.jpg",
  "beach-yoga.jpg",
  "forest-cycle.jpg",
];
const destinations = [
  ["Why Reasi", "the-gap"],
  ["How it works", "how-it-works"],
  ["Everyday life", "everyday-life"],
  ["Our approach", "our-approach"],
  ["For clinics", "for-clinics"],
  ["Our team", "our-team"],
];
const configurations = [
  { name: "desktop", width: 1440, height: 1080, screenshots: true },
  { name: "mobile", width: 390, height: 844, touch: true, screenshots: true },
  { name: "small-mobile", width: 320, height: 740, touch: true, reduced: true },
  { name: "tablet", width: 768, height: 1024, touch: true, reduced: true },
  { name: "compact-desktop", width: 1024, height: 900, reduced: true },
  { name: "desktop-breakpoint", width: 1250, height: 900, reduced: true },
  { name: "mobile-dark", width: 390, height: 844, touch: true, dark: true, reduced: true, screenshots: true },
  { name: "desktop-dark", width: 1440, height: 1080, dark: true, reduced: true, screenshots: true },
  { name: "mobile-nojs", width: 390, height: 844, touch: true, reduced: true, noJS: true },
  { name: "desktop-nojs", width: 1440, height: 1080, reduced: true, noJS: true },
];

await mkdir("artifacts", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const runtimeErrors = [];
const results = [];

async function closeMenu(page) {
  const menu = page.locator(".mobile-menu");
  if (await menu.evaluate(element => element.open)) {
    await page.locator(".menu-toggle").click();
  }
  await expect(page.locator(".mobile-menu-panel")).toBeHidden();
}

async function assertNoOverflow(page) {
  const sizes = await page.evaluate(() => ({
    viewport: window.innerWidth,
    document: document.documentElement.scrollWidth,
    body: document.body.scrollWidth,
  }));
  assert.ok(sizes.document <= sizes.viewport + 1, `document overflow: ${JSON.stringify(sizes)}`);
  assert.ok(sizes.body <= sizes.viewport + 1, `body overflow: ${JSON.stringify(sizes)}`);
}

async function assertReadableText(page) {
  const report = await page.locator("body").evaluate(body => {
    const undersizedText = [];
    const walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT);
    let node;
    let textCount = 0;
    while ((node = walker.nextNode())) {
      const element = node.parentElement;
      const text = node.textContent.trim();
      if (!text || !element || element.closest("script, style, noscript, template, svg, nextjs-portal")) continue;
      if (!element.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })) continue;
      const range = document.createRange();
      range.selectNodeContents(node);
      if (![...range.getClientRects()].some(rect => rect.width > 0 && rect.height > 0)) continue;
      const size = Number.parseFloat(getComputedStyle(element).fontSize);
      textCount += 1;
      if (size < 14) undersizedText.push({ text: text.slice(0, 90), size });
    }

    // Labels, attribution, roles and short notes are metadata, not body paragraphs.
    const metadata = [
      ".eyebrow", ".quote-note", ".approval-note", ".focus-label",
      ".future-label", ".future-note", ".founder p", ".photo-credits",
      ".footer-bottom",
    ].join(", ");
    const paragraphs = [...body.querySelectorAll("main p")]
      .filter(element => !element.matches(metadata) && !element.closest(".photo-credits"))
      .filter(element => element.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true }));
    return {
      textCount,
      paragraphCount: paragraphs.length,
      undersizedText,
      undersizedParagraphs: paragraphs.flatMap(element => {
        const size = Number.parseFloat(getComputedStyle(element).fontSize);
        return size < 18 ? [{ text: element.textContent.trim().slice(0, 90), size }] : [];
      }),
    };
  });
  assert.ok(report.textCount >= 40, "readability scan must inspect real rendered text, not attributes");
  assert.ok(report.paragraphCount >= 12, "body-paragraph scan must not exclude the main copy");
  assert.deepEqual(report.undersizedText, [], "visible text must be at least 14px");
  assert.deepEqual(report.undersizedParagraphs, [], "body paragraphs must be at least 18px");
}

async function assertImages(page) {
  const editorialImages = page.locator(".editorial-photo .photo-motion-image img");
  await expect(editorialImages).toHaveCount(lifestylePhotos.length);
  const sources = await editorialImages.evaluateAll(images => images.map(image => {
    const url = new URL(image.currentSrc || image.src, window.location.href);
    return url.searchParams.get("url") || url.pathname;
  }));
  assert.deepEqual(sources.map(source => source.split("/").at(-1)).sort(), [...lifestylePhotos].sort(), "all five distinct lifestyle photographs must appear exactly once");
  for (const image of await page.locator("img").all()) {
    assert.ok((await image.getAttribute("alt"))?.trim(), "content images need descriptions");
    await image.scrollIntoViewIfNeeded();
    await expect.poll(() => image.evaluate(element => element.complete && element.naturalWidth > 0), {
      message: `image loads: ${await image.getAttribute("src")}`,
      timeout: 15000,
    }).toBe(true);
  }
  const logo = page.locator(".site-header .brand-image");
  const dimensions = await logo.evaluate(element => {
    const rect = element.getBoundingClientRect();
    return { displayed: rect.width / rect.height, original: element.naturalWidth / element.naturalHeight };
  });
  assert.ok(Math.abs(dimensions.displayed - dimensions.original) < 0.01, "logo aspect ratio must stay intact");
}

function parseComputedColour(value) {
  const match = value.match(/^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:\s*[,/]\s*([\d.]+))?\s*\)$/);
  assert.ok(match, `expected a computed sRGB colour, received ${value}`);
  return [...match.slice(1, 4).map(Number), match[4] === undefined ? 1 : Number(match[4])];
}

function compositeColour(foreground, background) {
  const alpha = foreground[3] + background[3] * (1 - foreground[3]);
  return [
    ...foreground.slice(0, 3).map((channel, index) => (
      channel * foreground[3] + background[index] * background[3] * (1 - foreground[3])
    ) / alpha),
    alpha,
  ];
}

function contrastRatio(first, second) {
  const luminance = colour => colour.slice(0, 3)
    .map(channel => channel / 255)
    .map(channel => channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4)
    .reduce((sum, channel, index) => sum + channel * [.2126, .7152, .0722][index], 0);
  const values = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return (values[0] + .05) / (values[1] + .05);
}

function splitGradientLayers(value) {
  if (value === "none") return [];
  const layers = [];
  let depth = 0;
  let start = 0;
  for (let index = 0; index < value.length; index += 1) {
    if (value[index] === "(") depth += 1;
    if (value[index] === ")") depth -= 1;
    if (value[index] === "," && depth === 0) {
      layers.push(value.slice(start, index).trim());
      start = index + 1;
    }
  }
  layers.push(value.slice(start).trim());
  return layers;
}

function gradientColourBounds(backgrounds, pageColour) {
  let bounds = [pageColour, pageColour];
  const applyLayer = colours => {
    const candidates = bounds.flatMap(background => colours.map(colour => compositeColour(colour, background)));
    bounds = [
      [0, 1, 2].map(index => Math.min(...candidates.map(colour => colour[index]))).concat(1),
      [0, 1, 2].map(index => Math.max(...candidates.map(colour => colour[index]))).concat(1),
    ];
  };
  for (const background of backgrounds) {
    applyLayer([parseComputedColour(background.colour)]);
    // CSS paints the first listed gradient on top. Bounding every stop avoids
    // claiming that a translucent gradient has its flat backgroundColor value.
    for (const layer of splitGradientLayers(background.image).reverse()) {
      assert.match(layer, /^(?:radial|linear)-gradient\(/, `unsupported background image in contrast check: ${layer}`);
      const stops = [...layer.matchAll(/rgba?\([^)]*\)|\btransparent\b/g)].map(([stop]) => (
        stop === "transparent" ? [0, 0, 0, 0] : parseComputedColour(stop)
      ));
      assert.ok(stops.length >= 2, `gradient needs at least two readable colour stops: ${layer}`);
      applyLayer(stops);
    }
  }
  return bounds;
}

async function assertColourDirection(page) {
  const report = await page.evaluate(() => {
    const bodyStyle = getComputedStyle(document.body);
    const textSamples = [];
    const panels = document.querySelectorAll(".workflow-card, .quote-card, .approval-panel, .focus-panel, .final-panel");
    for (const panel of panels) {
      const walker = document.createTreeWalker(panel, NodeFilter.SHOW_TEXT);
      let node;
      while ((node = walker.nextNode())) {
        const text = node.textContent.trim();
        const element = node.parentElement;
        if (!text || !element || element.closest("svg, script, style")) continue;
        const backgrounds = [];
        for (let ancestor = element; ancestor && ancestor !== document.documentElement; ancestor = ancestor.parentElement) {
          const style = getComputedStyle(ancestor);
          backgrounds.push({ colour: style.backgroundColor, image: style.backgroundImage });
        }
        textSamples.push({
          text: text.slice(0, 90),
          colour: getComputedStyle(element).color,
          backgrounds: backgrounds.reverse(),
        });
      }
    }
    return {
      theme: document.documentElement.dataset.theme,
      page: bodyStyle.backgroundColor,
      ink: bodyStyle.color,
      photos: [...document.querySelectorAll(".editorial-photo .photo-motion-image img")].map(image => getComputedStyle(image).filter),
      cards: [...document.querySelectorAll(".workflow-card")].map(card => {
        const style = getComputedStyle(card);
        return { background: style.backgroundColor, gradients: style.backgroundImage, filter: style.backdropFilter || style.webkitBackdropFilter };
      }),
      textSamples,
    };
  });
  assert.equal(report.photos.length, lifestylePhotos.length, "all five editorial photographs must be present");
  for (const filter of report.photos) assert.doesNotMatch(filter, /grayscale|saturate\(0(?:\.0+)?\)/, "photographs must retain their original colour");
  if (report.theme === "light") {
    assert.deepEqual(parseComputedColour(report.page), [255, 255, 255, 1], "light theme retains its white page canvas");
    assert.deepEqual(parseComputedColour(report.ink), [16, 16, 16, 1], "light theme retains near-black text");
  }
  assert.equal(report.cards.length, 3, "all three workflow cards must be present");
  assert.equal(new Set(report.cards.map(card => card.gradients)).size, 3, "workflow cards need three distinct coloured reflections");
  for (const card of report.cards) {
    assert.equal(splitGradientLayers(card.gradients).length, 3, "glass cards retain two colour reflections and a sheen");
    assert.match(card.gradients, /radial-gradient/);
    assert.match(card.gradients, /linear-gradient/);
    assert.match(card.filter, /blur\(/, "glass cards retain backdrop blur");
    assert.ok(parseComputedColour(card.background)[3] < 1, "glass base remains translucent");
    const colours = [...card.gradients.matchAll(/rgba?\([^)]*\)/g)].map(([colour]) => parseComputedColour(colour));
    assert.ok(colours.some(colour => Math.max(...colour.slice(0, 3)) - Math.min(...colour.slice(0, 3)) >= 8), "card reflections need visible colour rather than only greys");
  }
  assert.ok(report.textSamples.length >= 20, "contrast check must inspect actual coloured-panel copy");
  for (const sample of report.textSamples) {
    const backgrounds = gradientColourBounds(sample.backgrounds, parseComputedColour(report.page));
    const foreground = parseComputedColour(sample.colour);
    assert.equal(foreground[3], 1, "gradient contrast check expects opaque text");
    const darkerThanBoth = backgrounds.every(background => foreground.slice(0, 3).every((channel, index) => channel <= background[index]));
    const lighterThanBoth = backgrounds.every(background => foreground.slice(0, 3).every((channel, index) => channel >= background[index]));
    assert.ok(darkerThanBoth || lighterThanBoth, `text colour crosses conservative gradient bounds: ${sample.text}`);
    const ratio = Math.min(...backgrounds.map(background => contrastRatio(foreground, background)));
    assert.ok(ratio >= 4.5, `gradient-panel conservative text contrast ${ratio.toFixed(2)}: ${sample.text}`);
  }
}

async function assertNavigation(page, noJS) {
  const desktop = page.getByRole("navigation", { name: "Main navigation", exact: true, includeHidden: true });
  const mobile = page.getByRole("navigation", { name: "Mobile navigation", exact: true, includeHidden: true });
  for (const [label, id] of destinations) {
    await expect(desktop.getByRole("link", { name: label, exact: true, includeHidden: true })).toHaveAttribute("href", `#${id}`);
    await expect(mobile.getByRole("link", { name: label, exact: true, includeHidden: true })).toHaveAttribute("href", `#${id}`);
    await expect(page.locator(`[id="${id}"]`)).toHaveCount(1);
  }
  const isMobile = await page.locator(".menu-toggle").isVisible();
  for (const [label, id] of destinations) {
    if (isMobile) {
      await closeMenu(page);
      await page.locator(".menu-toggle").click();
      await expect(page.locator(".mobile-menu-panel")).toBeVisible();
    }
    await (isMobile ? mobile : desktop).getByRole("link", { name: label, exact: true }).click();
    await expect.poll(() => new URL(page.url()).hash).toBe(`#${id}`);
    if (isMobile) {
      if (noJS) await closeMenu(page);
      else await expect(page.locator(".mobile-menu-panel")).toBeHidden();
    }
    // A working fragment must reveal the heading below the floating header.
    await expect.poll(() => page.locator(`#${id} h2`).evaluate(heading => {
      const rect = heading.getBoundingClientRect();
      const header = document.querySelector(".site-header").getBoundingClientRect();
      return rect.top >= header.bottom - 1 && rect.top < window.innerHeight;
    }), { message: `${label} scrolls into view without header occlusion` }).toBe(true);
    await assertNoOverflow(page);
  }
}

async function assertMobileBackdropLayers(page) {
  const layers = await page.locator(".mobile-menu-panel").evaluate(panel => {
    const header = document.querySelector(".site-header");
    const readBackdrop = style => ["backdrop-filter", "-webkit-backdrop-filter"]
      .map(property => style.getPropertyValue(property).trim())
      .find(value => value && value !== "none") || "none";
    const ancestorRoots = [];
    // Filter Effects 2 backdrop roots differ from ordinary stacking contexts:
    // https://drafts.csswg.org/filter-effects-2/#BackdropRoot
    const rootProperties = [
      "filter", "backdrop-filter", "-webkit-backdrop-filter", "clip-path",
      "mask-image", "-webkit-mask-image", "mask-border-source", "-webkit-mask-box-image-source",
    ];
    const rootHints = new Set([
      ...rootProperties, "opacity", "mix-blend-mode", "mask", "mask-border", "-webkit-mask",
    ]);
    for (let ancestor = panel.parentElement; ancestor && ancestor !== document.documentElement; ancestor = ancestor.parentElement) {
      const style = getComputedStyle(ancestor);
      const reasons = rootProperties.flatMap(property => {
        const value = style.getPropertyValue(property).trim();
        return value && value.split(",").some(part => part.trim() !== "none")
          ? [`${property}: ${value}`] : [];
      });
      if (Number(style.opacity) < 1) reasons.push(`opacity: ${style.opacity}`);
      if (style.mixBlendMode !== "normal") reasons.push(`mix-blend-mode: ${style.mixBlendMode}`);
      for (const hint of style.willChange.split(",").map(value => value.trim())) {
        if (rootHints.has(hint)) reasons.push(`will-change: ${hint}`);
      }
      if (reasons.length) ancestorRoots.push({
        element: `${ancestor.tagName.toLowerCase()}${ancestor.id ? `#${ancestor.id}` : ""}.${[...ancestor.classList].join(".")}`,
        reasons,
      });
    }
    return {
      header: readBackdrop(getComputedStyle(header)),
      headerGlass: readBackdrop(getComputedStyle(header, "::before")),
      menu: readBackdrop(getComputedStyle(panel)),
      ancestorRoots,
    };
  });
  assert.equal(layers.header, "none", "header ancestor must not isolate the menu's backdrop");
  for (const [name, filter] of [["header ::before", layers.headerGlass], ["menu panel", layers.menu]]) {
    const blur = filter.match(/\bblur\(([\d.]+)px\)/);
    assert.ok(blur && Number(blur[1]) > 0, `${name} must retain its independent blur: ${filter}`);
  }
  assert.deepEqual(layers.ancestorRoots, [], "mobile menu must sample the page without an intervening backdrop root");
}

async function assertMobileDisclosure(page, config) {
  const toggle = page.locator(".menu-toggle");
  if (!(await toggle.isVisible())) return;
  const menu = page.locator(".mobile-menu");
  const panel = page.locator(".mobile-menu-panel");
  const firstLink = page.getByRole("navigation", { name: "Mobile navigation" }).getByRole("link").first();
  const themeToggle = page.getByRole("button", { name: "Toggle light and dark theme" });
  await closeMenu(page);
  const bounds = await toggle.boundingBox();
  assert.ok(bounds.width >= 44 && bounds.height >= 44, "menu control needs a 44px touch target");
  await expect(toggle).toHaveAttribute("aria-controls", "mobile-navigation");

  // The disclosure must work by keyboard even when application JavaScript is off.
  await toggle.focus();
  await page.keyboard.press("Enter");
  await expect(panel).toBeVisible();
  await assertMobileBackdropLayers(page);
  await page.keyboard.press("Tab");
  await expect(firstLink).toBeFocused();
  await assertNoOverflow(page);
  await assertReadableText(page);
  await expect(panel.getByRole("link", { name: "Book a 15-minute call", exact: true })).toBeVisible();

  if (config.noJS) {
    await toggle.click();
  } else {
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("Escape");
    await expect(toggle).toBeFocused();
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
  }
  await expect(panel).toBeHidden();

  // A closed menu must not leave its links in the tab order.
  await toggle.focus();
  await page.keyboard.press("Tab");
  assert.equal(await menu.evaluate(element => element.contains(document.activeElement)), false);

  await toggle.focus();
  await page.keyboard.press("Space");
  await expect(panel).toBeVisible();
  await toggle.click();
  await expect(panel).toBeHidden();
  if (config.noJS) return;

  if (config.touch) await toggle.tap();
  else await toggle.click();
  await expect(panel).toBeVisible();
  await page.locator(".site-header .brand").click();
  await expect(panel).toBeHidden();

  await toggle.click();
  await expect(panel).toBeVisible();
  await themeToggle.focus();
  await expect(panel).toBeHidden();
  await expect(themeToggle).toBeFocused();

  await toggle.click();
  await page.getByRole("navigation", { name: "Mobile navigation" })
    .getByRole("link", { name: "How it works", exact: true }).click();
  await expect.poll(() => new URL(page.url()).hash).toBe("#how-it-works");
  await expect(panel).toBeHidden();
}

async function assertReducedMotion(page) {
  assert.equal(await page.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches), true);
  assert.equal(await page.locator("html").evaluate(element => getComputedStyle(element).scrollBehavior), "auto");
  for (const selector of [".hero-copy", ".hero-photo-wrap", ".story-photo-wrap", ".workflow-card", ".everyday-copy", ".everyday-detail-photo", ".photo-motion-image", ".approval-panel", ".focus-panel", ".founders-copy", ".final-panel"]) {
    for (const element of await page.locator(selector).all()) {
      await element.scrollIntoViewIfNeeded();
      await expect.poll(() => element.evaluate(node => {
        const style = getComputedStyle(node);
        const stationary = style.transform === "none" || new DOMMatrixReadOnly(style.transform).isIdentity;
        return Number(style.opacity) === 1 && stationary;
      }), { message: `${selector} stays fully visible without reveal movement` }).toBe(true);
    }
  }
  const cta = page.locator(".hero-copy .cta");
  await cta.hover();
  assert.equal(await cta.locator("svg").evaluate(element => getComputedStyle(element).transform), "none");
  const running = await page.evaluate(() => document.getAnimations()
    .filter(animation => animation.playState === "running" || animation.pending).length);
  assert.equal(running, 0, "reduced-motion pages must not run decorative animations");
}

async function takeScreenshots(page, name) {
  await page.evaluate(() => window.scrollTo({ top: 0, left: 0, behavior: "instant" }));
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  await expect.poll(() => page.locator(".hero-copy").evaluate(element => {
    const style = getComputedStyle(element);
    return Number(style.opacity) === 1
      && (style.transform === "none" || new DOMMatrixReadOnly(style.transform).isIdentity);
  })).toBe(true);
  const hero = await page.locator(".hero").boundingBox();
  assert.ok(hero, "hero has measurable bounds");
  // Capture the actual hero without changing the viewport or triggering new breakpoints.
  await page.screenshot({
    path: `artifacts/hero-${name}.png`,
    clip: { x: hero.x, y: hero.y, width: hero.width, height: hero.height },
    animations: "disabled",
  });
  await page.screenshot({ path: `artifacts/viewport-${name}.png`, animations: "disabled" });
  if (name.startsWith("desktop")) {
    await page.screenshot({ path: `artifacts/full-${name}.png`, fullPage: true, animations: "disabled" });
  }
}

try {
  for (const config of configurations) {
    const context = await browser.newContext({
      viewport: { width: config.width, height: config.height },
      colorScheme: config.dark ? "dark" : "light",
      reducedMotion: config.reduced ? "reduce" : "no-preference",
      hasTouch: Boolean(config.touch),
      javaScriptEnabled: !config.noJS,
    });
    const page = await context.newPage();
    page.setDefaultTimeout(10000);
    page.on("pageerror", error => runtimeErrors.push(`${config.name}: ${error.message}`));
    const result = { viewport: config.name, checks: [], failures: [], violations: [] };
    results.push(result);
    async function check(name, operation) {
      try {
        await operation();
        result.checks.push(name);
      } catch (error) {
        result.failures.push({ check: name, message: error.message });
      }
    }

    try {
      const response = await page.goto(base, { waitUntil: "load" });
      assert.equal(response?.status(), 200);
      await page.evaluate(() => document.fonts.ready);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

      await check("editorial content, booking links and copy", async () => {
        await expect(page.locator(".product-card, .product-grid, .basket-demo")).toHaveCount(0);
        const text = await page.locator("body").innerText();
        assert.match(text, /Clinics write the plan\./);
        assert.match(text, /clinician approval/i);
        assert.doesNotMatch(text, /[—]|revolutionize|seamless|unlock|GLP-1|ozempic|wegovy|mounjaro|Chobani|Brancourts|John West|Edgell/i);
        const ctas = page.locator('a[href="mailto:luke@reasiai.com"]').filter({ hasText: "Book a 15-minute call" });
        assert.ok(await ctas.count() >= 3, "booking stays available throughout the page");
        for (const cta of await page.getByRole("link", { name: "Book a 15-minute call", exact: true, includeHidden: true }).all()) {
          await expect(cta).toHaveAttribute("href", "mailto:luke@reasiai.com");
        }
      });
      await check("lifestyle photographs and undistorted logo", () => assertImages(page));
      await check("all six navigation destinations", () => assertNavigation(page, Boolean(config.noJS)));
      await check("mobile keyboard, touch and dismissal", () => assertMobileDisclosure(page, config));
      await check("readable rendered typography", () => assertReadableText(page));
      await check("no horizontal overflow", () => assertNoOverflow(page));

      if (!config.noJS) {
        await check("theme toggle works in both directions", async () => {
          const toggle = page.getByRole("button", { name: "Toggle light and dark theme" });
          await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
          await toggle.click();
          await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
          await expect(toggle).toHaveAttribute("aria-pressed", "true");
          await toggle.click();
          await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
          await expect(toggle).toHaveAttribute("aria-pressed", "false");
          if (config.dark) {
            await toggle.click();
            await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
          }
        });
      }
      await check("natural-colour photos, gradient glass and readable contrast", () => assertColourDirection(page));
      if (config.reduced) await check("reduced-motion accessibility", () => assertReducedMotion(page));
      if (config.screenshots) await check("hero and viewport captures", () => takeScreenshots(page, config.name));

      if (!config.noJS) {
        await check("WCAG accessibility audit", async () => {
          for (const state of ["closed", "open"]) {
            if (state === "open") {
              if (!(await page.locator(".menu-toggle").isVisible())) continue;
              await closeMenu(page);
              await page.locator(".menu-toggle").click();
              await expect(page.locator(".mobile-menu-panel")).toBeVisible();
            } else {
              await closeMenu(page);
            }
            const audit = await new AxeBuilder({ page })
              .exclude("nextjs-portal")
              .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
              .analyze();
            result.violations.push(...audit.violations.map(violation => ({
              state,
              id: violation.id,
              impact: violation.impact,
              nodes: violation.nodes.map(node => ({ target: node.target, summary: node.failureSummary })),
            })));
          }
          await closeMenu(page);
          assert.deepEqual(result.violations, []);
        });
      } else {
        result.checks.push("native no-JavaScript navigation; axe injection intentionally omitted");
      }
    } catch (error) {
      result.failures.push({ check: "page setup", message: error.message });
    } finally {
      console.log(JSON.stringify(result));
      await context.close();
    }
  }

  console.log(JSON.stringify({ base, runtimeErrors, results }, null, 2));
  assert.deepEqual(runtimeErrors, [], "browser runtime errors must be fixed");
  assert.deepEqual(results.flatMap(result => result.failures.map(failure => ({
    viewport: result.viewport, ...failure,
  }))), [], "all viewport and accessibility checks must pass");
} finally {
  await browser.close();
}
