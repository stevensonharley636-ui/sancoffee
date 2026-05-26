import React from "react";

export const Footer = () => {
  return (
    <footer
      data-testid="site-footer"
      className="bg-gh-primary text-white py-16"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 flex flex-col md:flex-row items-start md:items-end justify-between gap-10">
        <div>
          <img
            data-testid="footer-brand"
            src="https://customer-assets.emergentagent.com/job_direct-trade-5/artifacts/zbmsvdz6_logo.png"
            alt="Green-Haus"
            className="h-20 w-auto object-contain"
          />
          <p className="mt-5 text-sm opacity-80 max-w-sm leading-relaxed">
            Direct-trade coffee. Fairer futures. Connecting women farmers in
            Rwanda and Burundi with Germany.
          </p>
        </div>
        <div className="text-sm opacity-80 space-y-1 md:text-right">
          <p data-testid="footer-tagline">Direct-trade coffee. Fairer futures.</p>
          <p data-testid="footer-copyright">Green-Haus © 2026</p>
        </div>
      </div>
    </footer>
  );
};
