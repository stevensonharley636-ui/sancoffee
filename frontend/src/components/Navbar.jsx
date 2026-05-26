import React from "react";
import { Menu, X } from "lucide-react";

const links = [
  { id: "about", label: "Our Story" },
  { id: "products", label: "Coffee" },
  { id: "founder", label: "Founder" },
  { id: "impact", label: "Impact" },
  { id: "contact", label: "Contact" },
];

export const Navbar = () => {
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
          aria-label="Green-Haus home"
        >
          <img
            src="https://customer-assets.emergentagent.com/job_direct-trade-5/artifacts/zbmsvdz6_logo.png"
            alt="Green-Haus"
            className="h-10 w-10 object-contain rounded-sm bg-gh-primary p-1"
          />
          <span className="font-serif-display text-xl tracking-tight text-gh-primary hidden sm:inline">
            Green-Haus
          </span>
        </button>

        <nav className="hidden md:flex items-center gap-10">
          {links.map((l) => (
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
            {links.map((l) => (
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
