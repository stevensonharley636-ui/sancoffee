import React from "react";
import { ArrowRight } from "lucide-react";

const scrollTo = (id) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
};

export const Hero = () => {
  return (
    <section
      id="hero"
      data-testid="section-hero"
      className="relative pt-28 sm:pt-32 pb-20 sm:pb-28 hero-vignette overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        <div className="lg:col-span-7">
          <span data-testid="hero-overline" className="label-overline">
            Rwanda · Burundi → Germany
          </span>
          <h1
            data-testid="hero-headline"
            className="font-serif-display text-gh-primary text-5xl sm:text-6xl md:text-7xl leading-[1.05] tracking-tight mt-6"
          >
            Direct-Trade Coffee
            <br />
            Empowering
            <em className="not-italic text-gh-accent"> Women Farmers</em>.
          </h1>
          <p
            data-testid="hero-subheadline"
            className="mt-8 text-base sm:text-lg text-gh-soft max-w-xl leading-relaxed"
          >
            Green-Haus connects women coffee producers in Rwanda and Burundi
            directly with the German specialty coffee market — ensuring fair
            compensation, financial independence, and stronger local communities.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <button
              data-testid="hero-cta-products"
              onClick={() => scrollTo("products")}
              className="gh-btn-primary"
            >
              Explore our coffee <ArrowRight size={16} />
            </button>
            <button
              data-testid="hero-cta-contact"
              onClick={() => scrollTo("contact")}
              className="gh-btn-secondary"
            >
              Contact us
            </button>
          </div>

          <div className="mt-14 grid grid-cols-3 gap-6 max-w-md">
            {[
              ["Women-led", "cooperatives"],
              ["Direct", "trade model"],
              ["Specialty", "grade beans"],
            ].map(([a, b]) => (
              <div key={a} className="border-l border-gh-border pl-4">
                <p className="text-gh-primary font-serif-display text-lg">{a}</p>
                <p className="text-xs text-gh-soft tracking-wide">{b}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="relative">
            <img
              data-testid="hero-image"
              src="https://images.pexels.com/photos/31835038/pexels-photo-31835038.jpeg?auto=compress&cs=tinysrgb&w=1200"
              alt="Terraced green hills of Rwanda's coffee country"
              className="w-full aspect-[4/5] object-cover"
              loading="lazy"
            />
            <div className="absolute -bottom-6 -left-6 hidden sm:block bg-gh-secondary px-6 py-5 max-w-[220px] border border-gh-border">
              <p className="font-serif-display text-gh-primary text-xl leading-tight">
                "From the hills to your cup."
              </p>
              <p className="mt-2 text-xs tracking-wider uppercase text-gh-accent">
                Single origin · Direct trade
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
