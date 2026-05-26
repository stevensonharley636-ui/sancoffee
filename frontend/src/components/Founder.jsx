import React from "react";

export const Founder = () => {
  return (
    <section
      id="founder"
      data-testid="section-founder"
      className="py-24 sm:py-32 bg-gh-background"
    >
      <div className="max-w-6xl mx-auto px-6 sm:px-8">
        <div className="bg-gh-secondary border border-gh-border grid grid-cols-1 md:grid-cols-5 gap-0 overflow-hidden">
          <div className="md:col-span-2 relative bg-[#d8cfc0] min-h-[360px]">
            <img
              data-testid="founder-portrait"
              src="https://customer-assets.emergentagent.com/job_direct-trade-5/artifacts/v1gwh2s0_Christian.jpg"
              alt="Nsabemungu Christian Aime — Founder of Green-Haus"
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
            />
          </div>

          <div className="md:col-span-3 p-10 sm:p-14 flex flex-col justify-center">
            <span className="label-overline" data-testid="founder-overline">
              Meet the Founder
            </span>
            <h2
              data-testid="founder-name"
              className="font-serif-display text-gh-primary text-4xl sm:text-5xl mt-4 leading-tight"
            >
              Nsabemungu Christian Aime
            </h2>
            <span className="gh-divider mt-8 mb-8" />
            <p
              data-testid="founder-text"
              className="text-gh-soft text-base sm:text-lg leading-relaxed"
            >
              "Founded with a mission to create fairer access between East
              African women coffee farmers and the German coffee market —
              one carefully sourced harvest at a time."
            </p>
            <p className="mt-6 text-sm text-gh-text tracking-wide">
              — Founder, Green-Haus
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
