import React from "react";
import axios from "axios";
import { Mail, MapPin, Phone, Loader2 } from "lucide-react";
import { toast } from "sonner";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const Contact = () => {
  const [form, setForm] = React.useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = React.useState(false);

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error("Please fill in all fields.");
      return;
    }
    setLoading(true);
    try {
      const { data } = await axios.post(`${API}/contact`, form);
      toast.success(data.message || "Message sent.");
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      const detail = err?.response?.data?.detail || "Could not send. Please try again.";
      toast.error(detail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      id="contact"
      data-testid="section-contact"
      className="py-24 sm:py-32 bg-gh-secondary/30 border-t border-gh-border"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20">
        <div>
          <span className="label-overline" data-testid="contact-overline">
            Get in touch
          </span>
          <h2
            data-testid="contact-heading"
            className="font-serif-display text-gh-primary text-4xl sm:text-5xl mt-4 leading-tight tracking-tight"
          >
            Contact Green-Haus.
          </h2>
          <p className="mt-6 text-gh-soft text-base sm:text-lg leading-relaxed max-w-md">
            For wholesale, partnerships or just a conversation about specialty
            East African coffee — we'd love to hear from you.
          </p>

          <ul className="mt-10 space-y-6 text-sm sm:text-base">
            <li className="flex items-start gap-4" data-testid="contact-address">
              <MapPin size={18} className="mt-1 text-gh-primary" />
              <div>
                <p className="text-gh-text">Lüneburg, 21337</p>
                <p className="text-gh-soft">Germany</p>
              </div>
            </li>
            <li className="flex items-start gap-4" data-testid="contact-phone">
              <Phone size={18} className="mt-1 text-gh-primary" />
              <a href="tel:+4915214300152" className="text-gh-text hover:text-gh-primary">
                (+49) 0152 143 001 52
              </a>
            </li>
            <li className="flex items-start gap-4" data-testid="contact-email">
              <Mail size={18} className="mt-1 text-gh-primary" />
              <a
                href="mailto:nsabemungu@gmail.com"
                className="text-gh-text hover:text-gh-primary break-all"
              >
                nsabemungu@gmail.com
              </a>
            </li>
          </ul>
        </div>

        <form
          onSubmit={submit}
          data-testid="contact-form"
          className="bg-gh-surface border border-gh-border p-8 sm:p-10"
        >
          <div className="space-y-5">
            <div>
              <label className="label-overline block mb-2">Name</label>
              <input
                data-testid="contact-input-name"
                className="gh-input"
                value={form.name}
                onChange={update("name")}
                placeholder="Your name"
                required
              />
            </div>
            <div>
              <label className="label-overline block mb-2">Email</label>
              <input
                data-testid="contact-input-email"
                className="gh-input"
                type="email"
                value={form.email}
                onChange={update("email")}
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="label-overline block mb-2">Message</label>
              <textarea
                data-testid="contact-input-message"
                className="gh-input"
                value={form.message}
                onChange={update("message")}
                placeholder="How can we help?"
                required
              />
            </div>
            <button
              type="submit"
              data-testid="contact-submit"
              disabled={loading}
              className="gh-btn-primary w-full"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Sending…
                </>
              ) : (
                "Send message"
              )}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};
