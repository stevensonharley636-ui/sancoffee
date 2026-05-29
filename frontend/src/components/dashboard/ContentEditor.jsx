import React from "react";
import axios from "axios";
import { Loader2, Save, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import api, { API } from "../../lib/api";
import { DEFAULT_CONTENT } from "../../data/defaultContent";
import { mergeContent } from "../../context/ContentContext";
import { Section, TextField, AreaField, ImageField } from "./Field";

export default function ContentEditor() {
  const [data, setData] = React.useState(null);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    axios
      .get(`${API}/content`)
      .then(({ data }) => setData(mergeContent(DEFAULT_CONTENT, data)))
      .catch(() => setData(DEFAULT_CONTENT));
  }, []);

  const update = (path, value) => {
    setData((prev) => {
      const next = structuredClone(prev);
      const keys = path.split(".");
      let cur = next;
      for (let i = 0; i < keys.length - 1; i++) cur = cur[keys[i]];
      cur[keys[keys.length - 1]] = value;
      return next;
    });
  };

  const addCategory = () =>
    setData((p) => ({ ...p, categories: [...(p.categories || []), ""] }));
  const removeCategory = (i) =>
    setData((p) => ({ ...p, categories: p.categories.filter((_, idx) => idx !== i) }));

  const save = async () => {
    setSaving(true);
    try {
      await api.put("/admin/content", data);
      toast.success("Content published — changes are now live.");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Could not save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (!data) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-gh-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between sticky top-0 z-10 bg-gh-background/90 backdrop-blur py-3">
        <p className="text-sm text-gh-soft">
          Edit any section below, then publish to update the live website.
        </p>
        <button
          data-testid="content-save-btn"
          onClick={save}
          disabled={saving}
          className="gh-btn-primary !py-2.5 !px-5"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? "Publishing…" : "Publish changes"}
        </button>
      </div>

      {/* Site settings */}
      <Section title="Site Settings" description="Brand name, logo and footer text.">
        <TextField label="Site name" testid="cf-site-name" value={data.settings.siteName} onChange={(v) => update("settings.siteName", v)} />
        <ImageField label="Logo" testid="cf-logo" value={data.settings.logo} onChange={(v) => update("settings.logo", v)} />
        <AreaField label="Footer description" testid="cf-footer-desc" value={data.settings.footerDescription} onChange={(v) => update("settings.footerDescription", v)} />
        <TextField label="Footer tagline" testid="cf-footer-tagline" value={data.settings.footerTagline} onChange={(v) => update("settings.footerTagline", v)} />
        <TextField label="Copyright" testid="cf-copyright" value={data.settings.copyright} onChange={(v) => update("settings.copyright", v)} />
      </Section>

      {/* Navigation */}
      <Section title="Navigation Menu" description="Labels for the top navigation links.">
        {data.navLinks.map((l, i) => (
          <div key={l.id} className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-wide text-gh-soft w-24 flex-shrink-0">{l.id}</span>
            <input data-testid={`cf-nav-${l.id}`} className="gh-input flex-1" value={l.label} onChange={(e) => update(`navLinks.${i}.label`, e.target.value)} />
          </div>
        ))}
      </Section>

      {/* Categories */}
      <Section title="Product Categories / Tags" description="Used as selectable categories when editing products.">
        {(data.categories || []).map((c, i) => (
          <div key={i} className="flex items-center gap-3">
            <input data-testid={`cf-cat-${i}`} className="gh-input flex-1" value={c} onChange={(e) => update(`categories.${i}`, e.target.value)} />
            <button data-testid={`cf-cat-remove-${i}`} onClick={() => removeCategory(i)} className="text-gh-soft hover:text-red-600 p-2" aria-label="Remove category">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
        <button data-testid="cf-cat-add" onClick={addCategory} className="gh-btn-ghost">
          <Plus size={14} /> Add category
        </button>
      </Section>

      {/* Hero */}
      <Section title="Hero Section">
        <TextField label="Overline" testid="cf-hero-overline" value={data.hero.overline} onChange={(v) => update("hero.overline", v)} />
        <TextField label="Headline" testid="cf-hero-headline" value={data.hero.headline} onChange={(v) => update("hero.headline", v)} />
        <TextField label="Headline accent (highlighted words)" testid="cf-hero-accent" value={data.hero.headlineAccent} onChange={(v) => update("hero.headlineAccent", v)} />
        <AreaField label="Subheadline" testid="cf-hero-sub" value={data.hero.subheadline} onChange={(v) => update("hero.subheadline", v)} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextField label="Primary button" testid="cf-hero-cta1" value={data.hero.ctaPrimary} onChange={(v) => update("hero.ctaPrimary", v)} />
          <TextField label="Secondary button" testid="cf-hero-cta2" value={data.hero.ctaSecondary} onChange={(v) => update("hero.ctaSecondary", v)} />
        </div>
        <ImageField label="Hero image" testid="cf-hero-image" value={data.hero.image} onChange={(v) => update("hero.image", v)} />
        <TextField label="Image badge text" testid="cf-hero-badge" value={data.hero.badgeText} onChange={(v) => update("hero.badgeText", v)} />
        <TextField label="Image badge subtitle" testid="cf-hero-badgesub" value={data.hero.badgeSub} onChange={(v) => update("hero.badgeSub", v)} />
        <label className="label-overline block">Stats</label>
        {data.hero.stats.map((s, i) => (
          <div key={i} className="grid grid-cols-2 gap-3">
            <TextField testid={`cf-hero-stat-top-${i}`} value={s.top} onChange={(v) => update(`hero.stats.${i}.top`, v)} placeholder="Top" />
            <TextField testid={`cf-hero-stat-bottom-${i}`} value={s.bottom} onChange={(v) => update(`hero.stats.${i}.bottom`, v)} placeholder="Bottom" />
          </div>
        ))}
      </Section>

      {/* About */}
      <Section title="About / Our Story">
        <TextField label="Overline" testid="cf-about-overline" value={data.about.overline} onChange={(v) => update("about.overline", v)} />
        <TextField label="Heading" testid="cf-about-heading" value={data.about.heading} onChange={(v) => update("about.heading", v)} />
        <ImageField label="Image" testid="cf-about-image" value={data.about.image} onChange={(v) => update("about.image", v)} />
        <AreaField label="Paragraph 1" testid="cf-about-p1" value={data.about.paragraph1} onChange={(v) => update("about.paragraph1", v)} />
        <AreaField label="Paragraph 2" testid="cf-about-p2" value={data.about.paragraph2} onChange={(v) => update("about.paragraph2", v)} />
      </Section>

      {/* Products section heading */}
      <Section title="Products Section Heading" description="The intro text above the coffee grid. Manage individual products in the Products tab.">
        <TextField label="Overline" testid="cf-ps-overline" value={data.products_section.overline} onChange={(v) => update("products_section.overline", v)} />
        <TextField label="Heading" testid="cf-ps-heading" value={data.products_section.heading} onChange={(v) => update("products_section.heading", v)} />
        <AreaField label="Intro" testid="cf-ps-intro" value={data.products_section.intro} onChange={(v) => update("products_section.intro", v)} />
      </Section>

      {/* Founder */}
      <Section title="Founder">
        <TextField label="Overline" testid="cf-founder-overline" value={data.founder.overline} onChange={(v) => update("founder.overline", v)} />
        <TextField label="Name" testid="cf-founder-name" value={data.founder.name} onChange={(v) => update("founder.name", v)} />
        <ImageField label="Portrait" testid="cf-founder-image" value={data.founder.image} onChange={(v) => update("founder.image", v)} />
        <AreaField label="Quote" testid="cf-founder-quote" value={data.founder.quote} onChange={(v) => update("founder.quote", v)} />
        <TextField label="Role / attribution" testid="cf-founder-role" value={data.founder.role} onChange={(v) => update("founder.role", v)} />
      </Section>

      {/* Impact */}
      <Section title="Impact">
        <TextField label="Overline" testid="cf-impact-overline" value={data.impact.overline} onChange={(v) => update("impact.overline", v)} />
        <TextField label="Heading" testid="cf-impact-heading" value={data.impact.heading} onChange={(v) => update("impact.heading", v)} />
        {data.impact.items.map((it, i) => (
          <div key={i} className="border border-gh-border p-4 space-y-3">
            <TextField label={`Card ${i + 1} title`} testid={`cf-impact-title-${i}`} value={it.title} onChange={(v) => update(`impact.items.${i}.title`, v)} />
            <AreaField label="Body" testid={`cf-impact-body-${i}`} value={it.body} onChange={(v) => update(`impact.items.${i}.body`, v)} />
          </div>
        ))}
      </Section>

      {/* Contact */}
      <Section title="Contact Information">
        <TextField label="Overline" testid="cf-contact-overline" value={data.contact.overline} onChange={(v) => update("contact.overline", v)} />
        <TextField label="Heading" testid="cf-contact-heading" value={data.contact.heading} onChange={(v) => update("contact.heading", v)} />
        <AreaField label="Intro" testid="cf-contact-intro" value={data.contact.intro} onChange={(v) => update("contact.intro", v)} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextField label="Address line 1" testid="cf-contact-addr1" value={data.contact.addressLine1} onChange={(v) => update("contact.addressLine1", v)} />
          <TextField label="Address line 2" testid="cf-contact-addr2" value={data.contact.addressLine2} onChange={(v) => update("contact.addressLine2", v)} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextField label="Phone (link)" testid="cf-contact-phone" value={data.contact.phone} onChange={(v) => update("contact.phone", v)} />
          <TextField label="Phone (display)" testid="cf-contact-phonedisp" value={data.contact.phoneDisplay} onChange={(v) => update("contact.phoneDisplay", v)} />
        </div>
        <TextField label="Email" testid="cf-contact-email" value={data.contact.email} onChange={(v) => update("contact.email", v)} />
      </Section>

      <div className="flex justify-end pb-10">
        <button data-testid="content-save-btn-bottom" onClick={save} disabled={saving} className="gh-btn-primary">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? "Publishing…" : "Publish changes"}
        </button>
      </div>
    </div>
  );
}
