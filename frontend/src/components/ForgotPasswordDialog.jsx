import React from "react";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { API } from "../lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./ui/dialog";

export default function ForgotPasswordDialog({ open, onOpenChange }) {
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (open) setEmail("");
  }, [open]);

  const submit = async () => {
    if (!email) {
      toast.error("Please enter your email.");
      return;
    }
    setLoading(true);
    try {
      const { data } = await axios.post(`${API}/auth/forgot-password`, {
        email: email.trim(),
        base_url: window.location.origin,
      });
      toast.success(data.message || "If an account exists, a reset link has been sent.");
      onOpenChange(false);
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Could not send reset link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" data-testid="forgot-password-dialog">
        <DialogHeader>
          <DialogTitle className="font-serif-display text-gh-primary text-2xl">
            Forgot password
          </DialogTitle>
          <DialogDescription className="text-gh-soft text-sm">
            Enter your account email and we'll send you a link to reset your password.
          </DialogDescription>
        </DialogHeader>
        <div className="py-2">
          <label className="label-overline block mb-2">Email</label>
          <input
            data-testid="forgot-email"
            type="email"
            className="gh-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>
        <DialogFooter>
          <button onClick={() => onOpenChange(false)} className="gh-btn-secondary !py-2 !px-4">
            Cancel
          </button>
          <button data-testid="forgot-submit" onClick={submit} disabled={loading} className="gh-btn-primary !py-2 !px-4">
            {loading ? <Loader2 size={16} className="animate-spin" /> : null}
            Send reset link
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
