import React from "react";
import { useContent } from "../context/ContentContext";

export const Footer = () => {
  const { settings } = useContent();

  return (
    <footer
      data-testid="site-footer"
      className="bg-gh-primary text-white py-16"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 flex flex-col md:flex-row items-start md:items-end justify-between gap-10">
        <div>
          <img
            data-testid="footer-brand"
            src={settings.logo}
            alt={settings.siteName}
            className="h-20 w-auto object-contain"
          />
          <p className="mt-5 text-sm opacity-80 max-w-sm leading-relaxed">
            {settings.footerDescription}
          </p>
        </div>
        <div className="text-sm opacity-80 space-y-1 md:text-right">
          <p data-testid="footer-tagline">{settings.footerTagline}</p>
          <p data-testid="footer-copyright">{settings.copyright}</p>
        </div>
      </div>
    </footer>
  );
};
