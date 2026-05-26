import React from "react";
import axios from "axios";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const QuoteDialog = ({ product, open, onClose }) => {
  const [form, setForm] = React.useState({ name: "", email: "", quantity: "", message: "" });
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (open) setForm({ name: "", email: "", quantity: "", message: "" });
  }, [open, product]);

  if (!open || !product) return null;

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email) {
      toast.error("Name and email are required.");
      return;
    }
    setLoading(true);
    try {
      const { data } = await axios.post(`${API}/quote`, {
        name: form.name,
        email: form.email,
        product_name: product.name,
        quantity: form.quantity,
        message: form.message,
      });
      toast.success(data.message || "Quote request sent.");
      onClose();
    } catch (err) {
      const detail = err?.response?.data?.detail || "Could not send. Please try again.";
      toast.error(detail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      data-testid="quote-dialog-overlay"
      className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        data-testid="quote-dialog"
        className="bg-gh-surface w-full max-w-xl border border-gh-border relative max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          data-testid="quote-dialog-close"
          className="absolute top-4 right-4 text-gh-soft hover:text-gh-primary"
          onClick={onClose}
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <div className="p-8 sm:p-10">
          <span className="label-overline">Quote request</span>
          <h3 className="font-serif-display text-gh-primary text-2xl sm:text-3xl mt-3 leading-snug">
            {product.name}
          </h3>
          <p className="mt-2 text-sm text-gh-soft">
            {product.origin} · {product.roast} · €{product.price}
          </p>

          <form onSubmit={submit} className="mt-8 space-y-5" data-testid="quote-form">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label-overline block mb-2">Name</label>
                <input
                  data-testid="quote-input-name"
                  className="gh-input"
                  value={form.name}
                  onChange={update("name")}
                  required
                />
              </div>
              <div>
                <label className="label-overline block mb-2">Email</label>
                <input
                  data-testid="quote-input-email"
                  className="gh-input"
                  type="email"
                  value={form.email}
                  onChange={update("email")}
                  required
                />
              </div>
            </div>
            <div>
              <label className="label-overline block mb-2">Quantity (optional)</label>
              <input
                data-testid="quote-input-quantity"
                className="gh-input"
                value={form.quantity}
                onChange={update("quantity")}
                placeholder="e.g. 10 kg, 50 bags"
              />
            </div>
            <div>
              <label className="label-overline block mb-2">Message (optional)</label>
              <textarea
                data-testid="quote-input-message"
                className="gh-input"
                value={form.message}
                onChange={update("message")}
                placeholder="Tell us about your café, roastery or requirements."
              />
            </div>
            <button
              type="submit"
              data-testid="quote-submit"
              disabled={loading}
              className="gh-btn-primary w-full"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Sending…
                </>
              ) : (
                "Send quote request"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
