import React from "react";

export const Section = ({ title, description, children }) => (
  <div className="bg-gh-surface border border-gh-border p-6 sm:p-8">
    <h3 className="font-serif-display text-gh-primary text-2xl">{title}</h3>
    {description ? (
      <p className="text-gh-soft text-sm mt-1 mb-6">{description}</p>
    ) : (
      <div className="mb-6" />
    )}
    <div className="space-y-5">{children}</div>
  </div>
);

export const TextField = ({ label, value, onChange, placeholder, testid, type = "text" }) => (
  <div>
    {label ? <label className="label-overline block mb-2">{label}</label> : null}
    <input
      data-testid={testid}
      type={type}
      className="gh-input"
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  </div>
);

export const AreaField = ({ label, value, onChange, placeholder, testid, rows = 3 }) => (
  <div>
    {label ? <label className="label-overline block mb-2">{label}</label> : null}
    <textarea
      data-testid={testid}
      rows={rows}
      className="gh-input"
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  </div>
);

export const ImageField = ({ label, value, onChange, testid }) => (
  <div>
    {label ? <label className="label-overline block mb-2">{label}</label> : null}
    <div className="flex gap-3 items-start">
      {value ? (
        <img
          src={value}
          alt="preview"
          className="w-16 h-16 object-cover border border-gh-border rounded-sm flex-shrink-0"
        />
      ) : null}
      <input
        data-testid={testid}
        className="gh-input flex-1"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder="https://image-url…"
      />
    </div>
  </div>
);
