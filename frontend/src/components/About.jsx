import React from "react";
import { useContent } from "../context/ContentContext";

export const About = () => {
  const { about } = useContent();

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
            src={about.image}
            alt="Women harvesting coffee cherries"
            className="w-full aspect-[4/5] object-cover"
            loading="lazy"
          />
        </div>
        <div className="order-1 md:order-2">
          <span className="label-overline" data-testid="about-overline">
            {about.overline}
          </span>
          <h2
            data-testid="about-heading"
            className="font-serif-display text-gh-primary text-4xl sm:text-5xl mt-4 leading-tight tracking-tight"
          >
            {about.heading}
          </h2>
          <span className="gh-divider mt-8 mb-8" />
          <p
            data-testid="about-paragraph"
            className="text-gh-soft text-base sm:text-lg leading-relaxed"
          >
            {about.paragraph1}
          </p>
          <p className="text-gh-soft text-base sm:text-lg leading-relaxed mt-6">
            {about.paragraph2}
          </p>
        </div>
      </div>
    </section>
  );
};
