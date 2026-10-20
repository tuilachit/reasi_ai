"use client";

import { useEffect, useRef, useState } from "react";
import { ThemeToggle } from "./theme-toggle";
import { Brand, CTA } from "./ui";

const navigation = [
  { href: "#the-gap", label: "Why Reasi" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#everyday-life", label: "Everyday life" },
  { href: "#our-approach", label: "Our approach" },
  { href: "#for-clinics", label: "For clinics" },
  { href: "#our-team", label: "Our team" },
] as const;

export function SiteHeader() {
  const menuRef = useRef<HTMLDetailsElement>(null);
  const toggleRef = useRef<HTMLElement>(null);
  // Native details supplies its expanded state before JavaScript is available.
  const [isOpen, setIsOpen] = useState<boolean>();

  function closeMenu() {
    if (menuRef.current) menuRef.current.open = false;
  }

  useEffect(() => {
    function closeFromOutside(event: PointerEvent | FocusEvent) {
      const menu = menuRef.current;
      if (menu?.open && event.target instanceof Node && !menu.contains(event.target)) {
        menu.open = false;
      }
    }

    function closeFromEscape(event: KeyboardEvent) {
      if (event.key !== "Escape" || !menuRef.current?.open) return;
      event.preventDefault();
      menuRef.current.open = false;
      toggleRef.current?.focus();
    }

    document.addEventListener("pointerdown", closeFromOutside);
    document.addEventListener("focusin", closeFromOutside);
    document.addEventListener("keydown", closeFromEscape);

    return () => {
      document.removeEventListener("pointerdown", closeFromOutside);
      document.removeEventListener("focusin", closeFromOutside);
      document.removeEventListener("keydown", closeFromEscape);
    };
  }, []);

  return (
    <header className="site-header glass-surface">
      <div className="header-inner">
        <Brand />
        <nav className="desktop-nav" aria-label="Main navigation">
          {navigation.map(({ href, label }) => <a key={href} href={href}>{label}</a>)}
        </nav>
        <div className="header-actions">
          <CTA className="cta-small header-cta" />
          <ThemeToggle />
          <details
            ref={menuRef}
            className="mobile-menu"
            onToggle={event => setIsOpen(event.currentTarget.open)}
          >
            <summary
              ref={toggleRef}
              className="menu-toggle"
              aria-label="Navigation menu"
              aria-controls="mobile-navigation"
              aria-expanded={isOpen}
            >
              <span>Menu</span>
              <svg className="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path className="menu-line" d="M4 8h16" />
                <path className="menu-line" d="M4 16h16" />
              </svg>
            </summary>
            <div
              id="mobile-navigation"
              className="mobile-menu-panel"
              onClick={event => {
                if (event.target instanceof Element && event.target.closest("a")) closeMenu();
              }}
            >
              <nav className="mobile-nav" aria-label="Mobile navigation">
                {navigation.map(({ href, label }) => <a key={href} href={href}>{label}</a>)}
              </nav>
              <div className="mobile-menu-cta"><CTA /></div>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
