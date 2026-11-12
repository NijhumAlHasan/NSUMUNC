"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (res.ok) {
        router.push("/admin");
        router.refresh();
      } else {
        setError(data.error || "Login failed.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 mesh-bg">
      <div className="w-full max-w-md">
        <div className="glass rounded-3xl p-10 border border-white/10 shadow-2xl">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
              style={{background:"linear-gradient(135deg, var(--un-blue), var(--gold))"}}>
              <svg viewBox="0 0 40 40" className="w-9 h-9" fill="none" stroke="white" strokeWidth="1.5">
                <circle cx="20" cy="20" r="17"/>
                <ellipse cx="20" cy="20" rx="8" ry="17"/>
                <line x1="3" y1="20" x2="37" y2="20"/>
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
            <p className="text-sm mt-1" style={{color:"var(--text-muted)"}}>NSU Model UN Club</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2"
                style={{color:"var(--text-faint)"}}>
                Admin Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter admin password"
                required
                autoFocus
                className="input-glass w-full text-base"
              />
            </div>

            {error && (
              <div className="glass rounded-xl p-3 border border-red-500/20 text-sm text-red-400">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-3.5 rounded-2xl text-white font-bold text-base transition-all hover:brightness-110 disabled:opacity-50"
              style={{background:"var(--un-blue)"}}>
              {loading ? "Signing in…" : "Sign In →"}
            </button>
          </form>

          <p className="text-center text-xs mt-6" style={{color:"var(--text-faint)"}}>
            This area is restricted to authorised NSUMUNC administrators only.
          </p>
        </div>
      </div>
    </div>
  );
}
