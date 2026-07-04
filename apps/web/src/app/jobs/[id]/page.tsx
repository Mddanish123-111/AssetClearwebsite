"use client";

import { useEffect, useState, use as usePromise } from "react";
import { AppShell } from "@/components/AppShell";
import { StatusChip } from "@/components/StatusChip";
import { api, ApiClientError } from "@/lib/api";

const JOB_STATUSES = ["QUOTED", "SCHEDULED", "IN_PROGRESS", "AWAITING_DISPOSAL", "COMPLETED", "CANCELLED"];
const ASSET_CATEGORIES = ["FURNITURE", "IT_EQUIPMENT", "APPLIANCE", "FIXTURE", "ELECTRONICS", "DOCUMENTS", "MISC"];
const ASSET_CONDITIONS = ["EXCELLENT", "GOOD", "FAIR", "POOR", "SCRAP"];
const DISPOSITIONS = ["PENDING", "RESELL", "DONATE", "RECYCLE", "E_WASTE", "LANDFILL", "DATA_DESTRUCTION"];

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = usePromise(params);
  const [job, setJob] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAssetForm, setShowAssetForm] = useState(false);

  async function refresh() {
    try {
      setJob(await api.getJob(id));
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Could not load job.");
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleStatusChange(status: string) {
    await api.updateJobStatus(id, status);
    refresh();
  }

  async function handleDispositionChange(assetId: string, disposition: string) {
    await api.updateAssetDisposition(assetId, disposition);
    refresh();
  }

  if (error) {
    return (
      <AppShell>
        <p className="rounded-sm bg-rust/10 px-4 py-3 text-sm text-rust">{error}</p>
      </AppShell>
    );
  }

  if (!job) {
    return (
      <AppShell>
        <p className="text-sm text-ink/50">Loading…</p>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mb-2 flex items-center gap-3">
        <span className="asset-tag">{job.jobNumber}</span>
        <StatusChip value={job.status} />
      </div>
      <h1 className="h-page mb-1">{job.client?.companyName}</h1>
      <p className="mb-6 font-body text-sm text-ink/60">{job.siteAddress}</p>

      <div className="mb-6 card p-5">
        <p className="mb-2 font-mono text-[11px] uppercase tracking-tag text-ink/50">Update status</p>
        <div className="flex flex-wrap gap-2">
          {JOB_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => handleStatusChange(s)}
              className={
                s === job.status
                  ? "status-chip bg-ink text-paper"
                  : "status-chip border border-line bg-white text-ink/60 hover:bg-paper"
              }
            >
              {s.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </div>

      <div className="card mb-6">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="font-display text-xl uppercase tracking-wide">Asset manifest</h2>
          <button onClick={() => setShowAssetForm((v) => !v)} className="btn-primary">
            {showAssetForm ? "Close" : "+ Log asset"}
          </button>
        </div>

        {showAssetForm && (
          <AssetForm
            jobId={id}
            onCreated={() => {
              setShowAssetForm(false);
              refresh();
            }}
          />
        )}

        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-line font-mono text-[11px] uppercase tracking-tag text-ink/50">
              <th className="px-5 py-2">Tag</th>
              <th className="px-5 py-2">Description</th>
              <th className="px-5 py-2">Category</th>
              <th className="px-5 py-2">Condition</th>
              <th className="px-5 py-2">Disposition</th>
            </tr>
          </thead>
          <tbody>
            {job.assets?.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-6 text-center text-sm text-ink/50">
                  No assets logged yet.
                </td>
              </tr>
            )}
            {job.assets?.map((asset: any) => (
              <tr key={asset.id} className="border-b border-line last:border-0 hover:bg-paper">
                <td className="px-5 py-3">
                  <span className="asset-tag">{asset.assetTag}</span>
                </td>
                <td className="px-5 py-3 text-sm">{asset.description}</td>
                <td className="px-5 py-3 text-sm text-ink/70">{asset.category.replace(/_/g, " ")}</td>
                <td className="px-5 py-3 text-sm text-ink/70">{asset.condition}</td>
                <td className="px-5 py-3">
                  <select
                    value={asset.disposition}
                    onChange={(e) => handleDispositionChange(asset.id, e.target.value)}
                    className="rounded-sm border border-line bg-white px-2 py-1 font-mono text-xs uppercase tracking-tag"
                  >
                    {DISPOSITIONS.map((d) => (
                      <option key={d} value={d}>
                        {d.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card p-5">
        <p className="mb-3 font-mono text-[11px] uppercase tracking-tag text-ink/50">Status history</p>
        <ol className="space-y-2 border-l-2 border-line pl-4">
          {job.statusHistory?.map((event: any) => (
            <li key={event.id} className="relative text-sm">
              <span className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-amber" />
              <span className="font-medium">{event.status.replace(/_/g, " ")}</span>
              {event.note && <span className="text-ink/60"> — {event.note}</span>}
              <span className="ml-2 font-mono text-xs text-ink/40">
                {new Date(event.createdAt).toLocaleString()}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </AppShell>
  );
}

function AssetForm({ jobId, onCreated }: { jobId: string; onCreated: () => void }) {
  const [category, setCategory] = useState(ASSET_CATEGORIES[0]);
  const [description, setDescription] = useState("");
  const [condition, setCondition] = useState(ASSET_CONDITIONS[0]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await api.createAsset({ jobId, category, description, condition });
      setDescription("");
      onCreated();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Could not log asset.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3 border-b border-line bg-paper/60 px-5 py-4">
      <div className="flex-1 min-w-[200px]">
        <label className="mb-1 block font-mono text-[11px] uppercase tracking-tag text-ink/50">Description</label>
        <input
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g. Steelcase desks (x12)"
          className="w-full rounded-sm border border-line bg-white px-3 py-2 text-sm outline-none focus:border-ink"
        />
      </div>
      <div>
        <label className="mb-1 block font-mono text-[11px] uppercase tracking-tag text-ink/50">Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-sm border border-line bg-white px-3 py-2 text-sm"
        >
          {ASSET_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c.replace(/_/g, " ")}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block font-mono text-[11px] uppercase tracking-tag text-ink/50">Condition</label>
        <select
          value={condition}
          onChange={(e) => setCondition(e.target.value)}
          className="rounded-sm border border-line bg-white px-3 py-2 text-sm"
        >
          {ASSET_CONDITIONS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <button type="submit" disabled={saving} className="btn-primary">
        {saving ? "Saving…" : "Add"}
      </button>
      {error && <p className="w-full font-body text-sm text-rust">{error}</p>}
    </form>
  );
}
