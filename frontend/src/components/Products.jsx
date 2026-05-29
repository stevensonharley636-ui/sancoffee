import React from "react";
import axios from "axios";
import { ArrowRight } from "lucide-react";
import { PRODUCTS } from "../data/products";
import { useContent } from "../context/ContentContext";
import { API } from "../lib/api";

const formatEUR = (n) =>
  new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);

export const Products = ({ onRequestQuote }) => {
  const { products_section } = useContent();
  const [items, setItems] = React.useState(PRODUCTS);

  React.useEffect(() => {
    axios
      .get(`${API}/products`)
      .then(({ data }) => {
        if (Array.isArray(data) && data.length) setItems(data);
      })
      .catch(() => {});
  }, []);

  return (
    <section
      id="products"
      data-testid="section-products"
      className="py-24 sm:py-32 bg-gh-secondary/40"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="max-w-3xl">
          <span className="label-overline" data-testid="products-overline">
            {products_section.overline}
          </span>
          <h2
            data-testid="products-heading"
            className="font-serif-display text-gh-primary text-4xl sm:text-5xl mt-4 leading-tight tracking-tight"
          >
            {products_section.heading}
          </h2>
          <p className="mt-6 text-gh-soft text-base sm:text-lg leading-relaxed">
            {products_section.intro}
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((p) => (
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
                  {(p.notes || []).map((n) => (
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
