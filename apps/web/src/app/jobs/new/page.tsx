"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { api, ApiClientError } from "@/lib/api";

export default function NewJobPage() {
  const router = useRouter();
  const [clients, setClients] = useState<any[]>([]);
  const [clientId, setClientId] = useState("");
  const [siteAddress, setSiteAddress] = useState("");
  const [siteNotes, setSiteNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.listClients().then(setClients).catch(() => setClients([]));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const job = await api.createJob({ clientId, siteAddress, siteNotes: siteNotes || undefined });
      router.push(`/jobs/${job.id}`);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Could not create job.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell>
      <h1 className="h-page mb-6">New job</h1>
      <form onSubmit={handleSubmit} className="card max-w-lg space-y-4 p-6">
        <div>
          <label className="mb-1 block font-body text-sm font-medium text-ink">Client</label>
          <select
            required
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className="w-full rounded-sm border border-line bg-white px-3 py-2 font-body text-sm text-ink outline-none focus:border-ink"
          >
            <option value="" disabled>
              Select a client…
            </option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.companyName}
              </option>
            ))}
          </select>
          {clients.length === 0 && (
            <p className="mt-1 font-body text-xs text-ink/50">
              No clients yet — <a href="/clients/new" className="text-steel hover:underline">add one first</a>.
            </p>
          )}
        </div>

        <div>
          <label className="mb-1 block font-body text-sm font-medium text-ink">Site address</label>
          <input
            required
            value={siteAddress}
            onChange={(e) => setSiteAddress(e.target.value)}
            placeholder="123 Market St, Suite 400, San Francisco, CA"
            className="w-full rounded-sm border border-line bg-white px-3 py-2 font-body text-sm text-ink outline-none focus:border-ink"
          />
        </div>

        <div>
          <label className="mb-1 block font-body text-sm font-medium text-ink">Site notes (optional)</label>
          <textarea
            value={siteNotes}
            onChange={(e) => setSiteNotes(e.target.value)}
            rows={3}
            placeholder="Loading dock access, freight elevator code, building hours…"
            className="w-full rounded-sm border border-line bg-white px-3 py-2 font-body text-sm text-ink outline-none focus:border-ink"
          />
        </div>

        {error && <p className="rounded-sm bg-rust/10 px-3 py-2 font-body text-sm text-rust">{error}</p>}

        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? "Creating…" : "Create job"}
          </button>
          <a href="/jobs" className="btn-secondary">
            Cancel
          </a>
        </div>
      </form>
    </AppShell>
  );
}
