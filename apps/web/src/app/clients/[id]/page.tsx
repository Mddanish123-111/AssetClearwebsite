"use client";

import { useEffect, useState, use as usePromise } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { StatusChip } from "@/components/StatusChip";
import { api } from "@/lib/api";

export default function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = usePromise(params);
  const [client, setClient] = useState<any>(null);

  useEffect(() => {
    api.getClient(id).then(setClient).catch(() => setClient(null));
  }, [id]);

  if (!client) {
    return (
      <AppShell>
        <p className="text-sm text-ink/50">Loading…</p>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <h1 className="h-page mb-1">{client.companyName}</h1>
      <p className="mb-6 font-body text-sm text-ink/60">{client.billingEmail}</p>

      <div className="card">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="font-display text-xl uppercase tracking-wide">Jobs</h2>
          <Link href="/jobs/new" className="btn-primary">
            + New job
          </Link>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-line font-mono text-[11px] uppercase tracking-tag text-ink/50">
              <th className="px-5 py-2">Job #</th>
              <th className="px-5 py-2">Site</th>
              <th className="px-5 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {client.jobs?.length === 0 && (
              <tr>
                <td colSpan={3} className="px-5 py-6 text-center text-sm text-ink/50">
                  No jobs for this client yet.
                </td>
              </tr>
            )}
            {client.jobs?.map((job: any) => (
              <tr key={job.id} className="border-b border-line last:border-0 hover:bg-paper">
                <td className="px-5 py-3">
                  <Link href={`/jobs/${job.id}`} className="asset-tag">
                    {job.jobNumber}
                  </Link>
                </td>
                <td className="px-5 py-3 text-sm text-ink/70">{job.siteAddress}</td>
                <td className="px-5 py-3">
                  <StatusChip value={job.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
