import React from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { API } from "../lib/api";

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

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token");
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API}/auth/reset-password`, { token, new_password: password });
      toast.success("Password reset. You can now sign in.");
      navigate("/login", { replace: true });
    } catch (err) {
      toast.error(formatApiErrorDetail(err?.response?.data?.detail) || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gh-background px-6">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-12 h-12 rounded-full bg-gh-secondary flex items-center justify-center text-gh-primary">
            <KeyRound size={20} strokeWidth={1.5} />
          </div>
          <h1 className="font-serif-display text-gh-primary text-3xl mt-6">Set a new password</h1>
          <p className="text-gh-soft text-sm mt-2">Choose a new password for your dashboard account.</p>
        </div>

        {!token ? (
          <div data-testid="reset-no-token" className="bg-gh-surface border border-gh-border p-8 text-center">
            <p className="text-gh-soft text-sm">
              This reset link is invalid or incomplete. Please request a new one from the login page.
            </p>
            <a href="/login" className="gh-btn-primary mt-6 inline-flex">Back to login</a>
          </div>
        ) : (
          <form onSubmit={submit} data-testid="reset-form" className="bg-gh-surface border border-gh-border p-8 sm:p-10">
            <div className="space-y-5">
              <div>
                <label className="label-overline block mb-2">New password</label>
                <input data-testid="reset-password" className="gh-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
              </div>
              <div>
                <label className="label-overline block mb-2">Confirm new password</label>
                <input data-testid="reset-confirm" className="gh-input" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••" required />
              </div>
              <button type="submit" data-testid="reset-submit" disabled={loading} className="gh-btn-primary w-full">
                {loading ? <><Loader2 size={16} className="animate-spin" /> Resetting…</> : "Reset password"}
              </button>
            </div>
          </form>
        )}

        <p className="text-center text-xs text-gh-soft mt-6">
          <a href="/login" className="hover:text-gh-primary">← Back to login</a>
        </p>
      </div>
    </div>
  );
}
