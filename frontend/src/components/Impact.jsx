import React from "react";
import { Scale, Globe2, Users } from "lucide-react";
import { useContent } from "../context/ContentContext";

const ICONS = [Scale, Globe2, Users];

export const Impact = () => {
  const { impact } = useContent();

  return (
    <section
      id="impact"
      data-testid="section-impact"
      className="py-24 sm:py-32 bg-gh-background"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="max-w-2xl">
          <span className="label-overline" data-testid="impact-overline">
            {impact.overline}
          </span>
          <h2
            data-testid="impact-heading"
            className="font-serif-display text-gh-primary text-4xl sm:text-5xl mt-4 leading-tight tracking-tight"
          >
            {impact.heading}
          </h2>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {(impact.items || []).map((item, idx) => {
            const Icon = ICONS[idx % ICONS.length];
            return (
              <div
                key={idx}
                data-testid={`impact-card-${idx}`}
                className="bg-gh-surface border border-gh-border p-8 sm:p-10 flex flex-col"
              >
                <div className="w-12 h-12 rounded-full bg-gh-secondary flex items-center justify-center text-gh-primary">
                  <Icon size={20} strokeWidth={1.5} />
                </div>
                <h3 className="font-serif-display text-gh-primary text-2xl mt-6 leading-snug">
                  {item.title}
                </h3>
                <span className="gh-divider mt-5 mb-5" />
                <p className="text-gh-soft text-sm sm:text-base leading-relaxed">
                  {item.body}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
