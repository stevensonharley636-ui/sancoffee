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
            {/* Founder portrait placeholder — replace src below with uploaded portrait */}
            <div
              data-testid="founder-portrait-placeholder"
              className="absolute inset-0 flex items-center justify-center text-center px-6"
            >
              <div className="border border-gh-primary/30 w-full h-full flex flex-col items-center justify-center p-8">
                <div className="w-16 h-16 rounded-full border border-gh-primary/40 flex items-center justify-center font-serif-display text-2xl text-gh-primary">
                  NA
                </div>
                <p className="mt-5 font-serif-display text-gh-primary text-lg">
                  Founder portrait
                </p>
                <p className="mt-2 text-xs uppercase tracking-[0.2em] text-gh-accent">
                  Will be uploaded here
                </p>
              </div>
            </div>
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
