import React from "react";

export const About = () => {
  return (
    <section
      id="about"
      data-testid="section-about"
      className="py-24 sm:py-32 bg-gh-background"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
        <div className="order-2 md:order-1">
          <img
            data-testid="about-image"
            src="https://images.pexels.com/photos/34792534/pexels-photo-34792534.jpeg?auto=compress&cs=tinysrgb&w=1200"
            alt="Women harvesting coffee cherries"
            className="w-full aspect-[4/5] object-cover"
            loading="lazy"
          />
        </div>
        <div className="order-1 md:order-2">
          <span className="label-overline" data-testid="about-overline">
            Our Story
          </span>
          <h2
            data-testid="about-heading"
            className="font-serif-display text-gh-primary text-4xl sm:text-5xl mt-4 leading-tight tracking-tight"
          >
            A bridge between East African farms and German cups.
          </h2>
          <span className="gh-divider mt-8 mb-8" />
          <p
            data-testid="about-paragraph"
            className="text-gh-soft text-base sm:text-lg leading-relaxed"
          >
            Green-Haus is dedicated to transforming the lives of women coffee
            farmers in Rwanda and Burundi. Through our direct-trade model, we
            connect these producers directly with the German coffee market,
            ensuring they receive equitable compensation.
          </p>
          <p className="text-gh-soft text-base sm:text-lg leading-relaxed mt-6">
            This social impact fosters financial independence, strengthens
            local communities, and promotes gender equality across the
            specialty coffee supply chain.
          </p>
        </div>
      </div>
    </section>
  );
};
