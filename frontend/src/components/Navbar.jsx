import React from "react";
import { Menu, X } from "lucide-react";
import { useContent } from "../context/ContentContext";

export const Navbar = () => {
  const { navLinks, settings } = useContent();
  const [open, setOpen] = React.useState(false);

  const scrollTo = (id) => {
    setOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <header
      data-testid="site-navbar"
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur bg-[rgba(249,248,246,0.85)] border-b border-gh-border"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 h-16 flex items-center justify-between">
        <button
          data-testid="brand-logo"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex items-center gap-3"
          aria-label={`${settings.siteName} home`}
        >
          <img
            src={settings.logo}
            alt={settings.siteName}
            className="h-10 w-10 object-contain rounded-sm bg-gh-primary p-1"
          />
          <span className="font-serif-display text-xl tracking-tight text-gh-primary hidden sm:inline">
            {settings.siteName}
          </span>
        </button>

        <nav className="hidden md:flex items-center gap-10">
          {navLinks.map((l) => (
            <button
              key={l.id}
              data-testid={`nav-link-${l.id}`}
              onClick={() => scrollTo(l.id)}
              className="text-sm tracking-wide text-gh-text hover:text-gh-primary transition-colors"
            >
              {l.label}
            </button>
          ))}
        </nav>

        <button
          data-testid="nav-cta-contact"
          onClick={() => scrollTo("contact")}
          className="hidden md:inline-flex gh-btn-secondary !py-2 !px-4 !text-xs"
        >
          Get in touch
        </button>

        <button
          data-testid="mobile-menu-toggle"
          className="md:hidden text-gh-primary"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div data-testid="mobile-menu" className="md:hidden bg-gh-background border-t border-gh-border">
          <div className="px-6 py-4 flex flex-col gap-4">
            {navLinks.map((l) => (
              <button
                key={l.id}
                data-testid={`mobile-nav-link-${l.id}`}
                onClick={() => scrollTo(l.id)}
                className="text-left text-base text-gh-text"
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};
