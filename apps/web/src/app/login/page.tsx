"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, setToken, ApiClientError } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { token } = await api.login(email, password);
      setToken(token);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mb-1 flex items-baseline justify-center gap-1.5">
            <span className="font-display text-3xl uppercase tracking-wide text-paper">Asset</span>
            <span className="font-display text-3xl uppercase tracking-wide text-amber">Clear</span>
          </div>
          <p className="font-mono text-xs uppercase tracking-tag text-paper/50">Clearance Operations Console</p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4 p-6">
          <div>
            <label htmlFor="email" className="mb-1 block font-body text-sm font-medium text-ink">
              Work email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-sm border border-line bg-white px-3 py-2 font-body text-sm text-ink outline-none focus:border-ink"
              placeholder="you@company.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block font-body text-sm font-medium text-ink">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-sm border border-line bg-white px-3 py-2 font-body text-sm text-ink outline-none focus:border-ink"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="rounded-sm bg-rust/10 px-3 py-2 font-body text-sm text-rust" role="alert">
              {error}
            </p>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-4 text-center font-mono text-xs text-paper/40">
          Seeded demo: admin@assetclear.io / ChangeMe123!
        </p>
      </div>
    </div>
  );
}
