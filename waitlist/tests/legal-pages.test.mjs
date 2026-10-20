import test from "node:test";
import assert from "node:assert/strict";

const base = process.env.SITE_URL;
const documents = [
  { path: "/privacy", title: "Privacy Policy", sections: 9, dated: true, preservedText: "7. Your choices and account deletion" },
  { path: "/terms", title: "Terms of Service", sections: 12, dated: true, preservedText: "10. Consumer rights and liability" },
  { path: "/support", title: "Reasi Support", sections: 6, dated: false, preservedText: "Delete your account" },
];

for (const document of documents) {
  test(`${document.path} preserves the existing legal or support page in served HTML`, { skip: !base }, async () => {
    const response = await fetch(new URL(document.path, base));
    assert.equal(response.status, 200, `${document.path} must remain available after the homepage migration`);
    const rendered = (await response.text()).replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, "");
    assert.equal(rendered.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/)?.[1], document.title);
    assert.equal(rendered.match(/<title>([\s\S]*?)<\/title>/)?.[1], `${document.title} | Reasi`);
    const content = rendered.match(/<article\b[^>]*class="legal-content"[^>]*>([\s\S]*?)<\/article>/)?.[1];
    assert.ok(content, "substantive content must be rendered without JavaScript");
    assert.equal([...content.matchAll(/<h2\b/g)].length, document.sections, "all existing document sections are retained");
    assert.ok(content.includes(document.preservedText));
    assert.match(content, /href="mailto:support@reasiai\.com"/);
    if (document.dated) assert.match(rendered, /Effective and last updated:\s*(?:<!--[^>]*-->\s*)?31 August 2026/);
    else assert.doesNotMatch(rendered, /Effective and last updated:/, "support page does not invent an effective date");
    for (const path of ["/", "/privacy", "/terms", "/support"]) {
      assert.ok(rendered.includes(`href="${path}"`), `document navigation retains ${path}`);
    }
  });
}
