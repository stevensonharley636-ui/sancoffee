import React from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Lock } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";

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

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (user) navigate("/dashboard", { replace: true });
  }, [user, navigate]);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email.trim(), password);
      toast.success("Welcome back.");
      navigate("/dashboard", { replace: true });
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
            <Lock size={20} strokeWidth={1.5} />
          </div>
          <h1 className="font-serif-display text-gh-primary text-3xl mt-6">
            Editor Sign In
          </h1>
          <p className="text-gh-soft text-sm mt-2">
            Manage your Green-Haus website content.
          </p>
        </div>

        <form
          onSubmit={submit}
          data-testid="login-form"
          className="bg-gh-surface border border-gh-border p-8 sm:p-10"
        >
          <div className="space-y-5">
            <div>
              <label className="label-overline block mb-2">Email</label>
              <input
                data-testid="login-email"
                className="gh-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="label-overline block mb-2">Password</label>
              <input
                data-testid="login-password"
                className="gh-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              data-testid="login-submit"
              disabled={loading}
              className="gh-btn-primary w-full"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Signing in…
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </div>
        </form>

        <p className="text-center text-xs text-gh-soft mt-6">
          <a href="/" className="hover:text-gh-primary">
            ← Back to website
          </a>
        </p>
      </div>
    </div>
  );
}
