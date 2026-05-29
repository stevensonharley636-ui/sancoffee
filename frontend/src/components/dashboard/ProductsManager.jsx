import React from "react";
import axios from "axios";
import { Loader2, Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import api, { API } from "../../lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Switch } from "../ui/switch";
import { TextField, AreaField, ImageField } from "./Field";

const EMPTY = {
  name: "",
  origin: "",
  roast: "",
  category: "",
  notes: [],
  price: 0,
  description: "",
  image: "",
  published: true,
};

const formatEUR = (n) =>
  new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n || 0);

export default function ProductsManager() {
  const [products, setProducts] = React.useState(null);
  const [categories, setCategories] = React.useState([]);
  const [editing, setEditing] = React.useState(null); // product object or null
  const [open, setOpen] = React.useState(false);
  const [notesText, setNotesText] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  const load = React.useCallback(async () => {
    const { data } = await api.get("/admin/products");
    setProducts(data);
  }, []);

  React.useEffect(() => {
    load().catch(() => toast.error("Could not load products."));
    axios.get(`${API}/content`).then(({ data }) => setCategories(data.categories || [])).catch(() => {});
  }, [load]);

  const openNew = () => {
    setEditing({ ...EMPTY });
    setNotesText("");
    setOpen(true);
  };

  const openEdit = (p) => {
    setEditing({ ...p });
    setNotesText((p.notes || []).join(", "));
    setOpen(true);
  };

  const setField = (k, v) => setEditing((e) => ({ ...e, [k]: v }));

  const save = async () => {
    if (!editing.name.trim()) {
      toast.error("Product name is required.");
      return;
    }
    setSaving(true);
    const payload = {
      ...editing,
      price: parseFloat(editing.price) || 0,
      notes: notesText.split(",").map((s) => s.trim()).filter(Boolean),
    };
    try {
      if (editing.id) {
        await api.put(`/admin/products/${editing.id}`, payload);
        toast.success("Product updated.");
      } else {
        await api.post("/admin/products", payload);
        toast.success("Product created.");
      }
      setOpen(false);
      await load();
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Could not save product.");
    } finally {
      setSaving(false);
    }
  };

  const togglePublish = async (p) => {
    try {
      await api.patch(`/admin/products/${p.id}/publish`);
      await load();
    } catch {
      toast.error("Could not change visibility.");
    }
  };

  const remove = async (p) => {
    if (!window.confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/products/${p.id}`);
      toast.success("Product deleted.");
      await load();
    } catch {
      toast.error("Could not delete product.");
    }
  };

  if (!products) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-gh-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gh-soft">
          {products.length} product{products.length === 1 ? "" : "s"} · unpublished items are hidden from the public site.
        </p>
        <button data-testid="product-new-btn" onClick={openNew} className="gh-btn-primary !py-2.5 !px-5">
          <Plus size={16} /> New product
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {products.map((p) => (
          <div key={p.id} data-testid={`admin-product-${p.id}`} className="bg-gh-surface border border-gh-border overflow-hidden flex flex-col">
            <div className="relative">
              {p.image ? (
                <img src={p.image} alt={p.name} className="w-full h-40 object-cover" />
              ) : (
                <div className="w-full h-40 bg-gh-secondary" />
              )}
              <span
                className={`absolute top-3 left-3 text-xs px-2 py-1 ${p.published ? "bg-gh-primary text-white" : "bg-gh-soft/80 text-white"}`}
              >
                {p.published ? "Published" : "Hidden"}
              </span>
            </div>
            <div className="p-4 flex flex-col flex-grow">
              <div className="flex items-center justify-between gap-2">
                <span className="label-overline">{p.origin || "—"}</span>
                <span className="font-serif-display text-gh-primary">{formatEUR(p.price)}</span>
              </div>
              <h4 className="font-serif-display text-gh-text text-lg mt-2 leading-snug">{p.name}</h4>
              {p.category ? (
                <span className="text-xs text-gh-accent uppercase tracking-wider mt-1">{p.category}</span>
              ) : null}

              <div className="mt-4 pt-4 border-t border-gh-border flex items-center gap-2 flex-wrap">
                <button data-testid={`product-edit-${p.id}`} onClick={() => openEdit(p)} className="gh-btn-ghost !py-1.5 !px-3 !text-xs">
                  <Pencil size={13} /> Edit
                </button>
                <button data-testid={`product-publish-${p.id}`} onClick={() => togglePublish(p)} className="gh-btn-ghost !py-1.5 !px-3 !text-xs">
                  {p.published ? <EyeOff size={13} /> : <Eye size={13} />}
                  {p.published ? "Hide" : "Publish"}
                </button>
                <button data-testid={`product-delete-${p.id}`} onClick={() => remove(p)} className="ml-auto text-gh-soft hover:text-red-600 p-1.5" aria-label="Delete">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto" data-testid="product-form-dialog">
          <DialogHeader>
            <DialogTitle className="font-serif-display text-gh-primary text-2xl">
              {editing?.id ? "Edit product" : "New product"}
            </DialogTitle>
          </DialogHeader>
          {editing ? (
            <div className="space-y-4 py-2">
              <TextField label="Name" testid="pf-name" value={editing.name} onChange={(v) => setField("name", v)} />
              <div className="grid grid-cols-2 gap-4">
                <TextField label="Origin" testid="pf-origin" value={editing.origin} onChange={(v) => setField("origin", v)} />
                <TextField label="Roast" testid="pf-roast" value={editing.roast} onChange={(v) => setField("roast", v)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-overline block mb-2">Category</label>
                  <input data-testid="pf-category" className="gh-input" list="pf-categories" value={editing.category} onChange={(e) => setField("category", e.target.value)} placeholder="Select or type…" />
                  <datalist id="pf-categories">
                    {categories.map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </div>
                <TextField label="Price (EUR)" testid="pf-price" type="number" value={editing.price} onChange={(v) => setField("price", v)} />
              </div>
              <TextField label="Tasting notes (comma separated)" testid="pf-notes" value={notesText} onChange={setNotesText} placeholder="Citrus, Caramel, Berries" />
              <AreaField label="Description" testid="pf-description" value={editing.description} onChange={(v) => setField("description", v)} rows={4} />
              <ImageField label="Product image" testid="pf-image" value={editing.image} onChange={(v) => setField("image", v)} />
              <div className="flex items-center justify-between border border-gh-border p-3">
                <span className="text-sm text-gh-text">Published (visible on website)</span>
                <Switch data-testid="pf-published" checked={editing.published} onCheckedChange={(v) => setField("published", v)} />
              </div>
            </div>
          ) : null}
          <DialogFooter>
            <button onClick={() => setOpen(false)} className="gh-btn-secondary !py-2 !px-4">Cancel</button>
            <button data-testid="pf-save" onClick={save} disabled={saving} className="gh-btn-primary !py-2 !px-4">
              {saving ? <Loader2 size={16} className="animate-spin" /> : null}
              {editing?.id ? "Save changes" : "Create product"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
