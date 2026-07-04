"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { api, ApiClientError } from "@/lib/api";

export default function NewClientPage() {
  const router = useRouter();
  const [companyName, setCompanyName] = useState("");
  const [billingEmail, setBillingEmail] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const client = await api.createClient({ companyName, billingEmail, billingAddress: billingAddress || undefined });
      router.push(`/clients/${client.id}`);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Could not create client.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell>
      <h1 className="h-page mb-6">New client</h1>
      <form onSubmit={handleSubmit} className="card max-w-lg space-y-4 p-6">
        <div>
          <label className="mb-1 block font-body text-sm font-medium text-ink">Company name</label>
          <input
            required
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="w-full rounded-sm border border-line bg-white px-3 py-2 font-body text-sm text-ink outline-none focus:border-ink"
          />
        </div>
        <div>
          <label className="mb-1 block font-body text-sm font-medium text-ink">Billing email</label>
          <input
            required
            type="email"
            value={billingEmail}
            onChange={(e) => setBillingEmail(e.target.value)}
            className="w-full rounded-sm border border-line bg-white px-3 py-2 font-body text-sm text-ink outline-none focus:border-ink"
          />
        </div>
        <div>
          <label className="mb-1 block font-body text-sm font-medium text-ink">Billing address (optional)</label>
          <input
            value={billingAddress}
            onChange={(e) => setBillingAddress(e.target.value)}
            className="w-full rounded-sm border border-line bg-white px-3 py-2 font-body text-sm text-ink outline-none focus:border-ink"
          />
        </div>

        {error && <p className="rounded-sm bg-rust/10 px-3 py-2 font-body text-sm text-rust">{error}</p>}

        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? "Creating…" : "Create client"}
          </button>
          <a href="/clients" className="btn-secondary">
            Cancel
          </a>
        </div>
      </form>
    </AppShell>
  );
}
