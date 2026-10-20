"use client";

import { useState } from "react";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  function toggle() {
    const root = document.documentElement;
    const dark = root.dataset.theme === "dark";
    root.dataset.theme = dark ? "light" : "dark";
    setIsDark(!dark);
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", dark ? "#ffffff" : "#0b0b0b");
  }
  return <button type="button" className="theme-toggle" onClick={toggle} aria-label="Toggle light and dark theme" aria-pressed={isDark} title="Toggle light and dark theme">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><circle cx="12" cy="12" r="7" /><path d="M12 5a7 7 0 0 1 0 14Z" fill="currentColor" /></svg>
  </button>;
}
