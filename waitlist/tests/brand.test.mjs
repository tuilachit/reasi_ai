import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../src/app/globals.css", import.meta.url), "utf8");
const layout = readFileSync(new URL("../src/app/layout.tsx", import.meta.url), "utf8");

test("the brand retains a white default canvas and black typography", () => {
  assert.match(css, /--page:\s*#ffffff/);
  assert.match(css, /--ink:\s*#101010/);
  assert.doesNotMatch(layout, /Instrument_Serif/);
  assert.match(layout, /data-theme="light"/);
  assert.doesNotMatch(css, /font-editorial|dashed/);
});

test("the supplied logo is used as an image, not a recreated wordmark", () => {
  const component = readFileSync(new URL("../src/components/ui.tsx", import.meta.url), "utf8");
  assert.match(component, /src="\/reasi-logo\.jpeg"/);
  const logo = readFileSync(new URL("../public/reasi-logo.jpeg", import.meta.url));
  assert.equal(logo.readUInt16BE(0), 0xffd8, "valid original JPEG");
});
