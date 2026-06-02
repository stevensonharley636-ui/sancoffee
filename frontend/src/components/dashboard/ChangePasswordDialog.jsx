import React from "react";
import { Loader2, KeyRound } from "lucide-react";
import { toast } from "sonner";
import api from "../../lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import { TextField } from "./Field";

function formatApiErrorDetail(detail) {
  if (detail == null) return "Something went wrong. Please try again.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail))
    return detail
      .map((e) => (e && typeof e.msg === "string" ? e.msg : JSON.stringify(e)))
      .filter(Boolean)
      .join(" ");
  if (detail && typeof detail.msg === "string") return detail.msg;
  return String(detail);
}

export default function ChangePasswordDialog({ open, onOpenChange }) {
  const [current, setCurrent] = React.useState("");
  const [next, setNext] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setCurrent("");
      setNext("");
      setConfirm("");
    }
  }, [open]);

  const submit = async () => {
    if (!current || !next) {
      toast.error("Please fill in all fields.");
      return;
    }
    if (next.length < 8) {
      toast.error("New password must be at least 8 characters.");
      return;
    }
    if (next !== confirm) {
      toast.error("New passwords do not match.");
      return;
    }
    setSaving(true);
    try {
      await api.post("/auth/change-password", {
        current_password: current,
        new_password: next,
      });
      toast.success("Password updated successfully.");
      onOpenChange(false);
    } catch (err) {
      toast.error(formatApiErrorDetail(err?.response?.data?.detail) || err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" data-testid="change-password-dialog">
        <DialogHeader>
          <DialogTitle className="font-serif-display text-gh-primary text-2xl">
            Change password
          </DialogTitle>
          <DialogDescription className="text-gh-soft text-sm">
            Enter your current password and choose a new one (at least 8 characters).
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <TextField label="Current password" testid="cp-current" type="password" value={current} onChange={setCurrent} />
          <TextField label="New password" testid="cp-new" type="password" value={next} onChange={setNext} />
          <TextField label="Confirm new password" testid="cp-confirm" type="password" value={confirm} onChange={setConfirm} />
        </div>
        <DialogFooter>
          <button onClick={() => onOpenChange(false)} className="gh-btn-secondary !py-2 !px-4">
            Cancel
          </button>
          <button data-testid="cp-save" onClick={submit} disabled={saving} className="gh-btn-primary !py-2 !px-4">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <KeyRound size={15} />}
            Update password
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
