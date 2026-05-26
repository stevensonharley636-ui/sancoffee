import React from "react";
import { PRODUCTS } from "../data/products";
import { ArrowRight } from "lucide-react";

const formatEUR = (n) =>
  new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);

export const Products = ({ onRequestQuote }) => {
  return (
    <section
      id="products"
      data-testid="section-products"
      className="py-24 sm:py-32 bg-gh-secondary/40"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="max-w-3xl">
          <span className="label-overline" data-testid="products-overline">
            The Collection
          </span>
          <h2
            data-testid="products-heading"
            className="font-serif-display text-gh-primary text-4xl sm:text-5xl mt-4 leading-tight tracking-tight"
          >
            Five expressions of East African terroir.
          </h2>
          <p className="mt-6 text-gh-soft text-base sm:text-lg leading-relaxed">
            Each lot is traceable to the cooperative that grew it. Prices
            shown are per 250g bag — wholesale inquiries welcome.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {PRODUCTS.map((p) => (
            <article
              key={p.id}
              data-testid={`product-card-${p.id}`}
              className="gh-card"
            >
              <div className="overflow-hidden">
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-full aspect-[4/5] object-cover"
                  loading="lazy"
                  data-testid={`product-image-${p.id}`}
                />
              </div>
              <div className="p-6 sm:p-7 flex flex-col flex-grow">
                <div className="flex items-center justify-between">
                  <span className="label-overline">{p.origin}</span>
                  <span
                    data-testid={`product-price-${p.id}`}
                    className="font-serif-display text-gh-primary text-xl"
                  >
                    {formatEUR(p.price)}
                  </span>
                </div>

                <h3
                  data-testid={`product-name-${p.id}`}
                  className="font-serif-display text-gh-text text-2xl mt-3 leading-snug"
                >
                  {p.name}
                </h3>

                <p className="mt-2 text-xs uppercase tracking-[0.18em] text-gh-accent">
                  {p.roast}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {p.notes.map((n) => (
                    <span
                      key={n}
                      className="text-xs px-3 py-1 border border-gh-border text-gh-soft"
                    >
                      {n}
                    </span>
                  ))}
                </div>

                <p className="mt-5 text-sm text-gh-soft leading-relaxed flex-grow">
                  {p.description}
                </p>

                <button
                  data-testid={`product-quote-btn-${p.id}`}
                  onClick={() => onRequestQuote(p)}
                  className="gh-btn-ghost mt-6"
                >
                  Request quote <ArrowRight size={14} />
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
