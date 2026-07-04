"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { StatusChip } from "@/components/StatusChip";
import { api } from "@/lib/api";

export default function DashboardPage() {
  const [jobs, setJobs] = useState<any[] | null>(null);

  useEffect(() => {
    api.listJobs().then(setJobs).catch(() => setJobs([]));
  }, []);

  const active = jobs?.filter((j) => j.status === "IN_PROGRESS").length ?? 0;
  const scheduled = jobs?.filter((j) => j.status === "SCHEDULED").length ?? 0;
  const awaitingDisposal = jobs?.filter((j) => j.status === "AWAITING_DISPOSAL").length ?? 0;

  return (
    <AppShell>
      <h1 className="h-page mb-6">Dispatch Board</h1>

      <div className="mb-8 grid grid-cols-3 gap-4">
        <SummaryCard label="On site now" value={active} accent="amber" />
        <SummaryCard label="Scheduled" value={scheduled} accent="steel" />
        <SummaryCard label="Awaiting disposal" value={awaitingDisposal} accent="rust" />
      </div>

      <div className="card">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="font-display text-xl uppercase tracking-wide">Recent jobs</h2>
          <Link href="/jobs" className="font-body text-sm font-medium text-steel hover:underline">
            View all →
          </Link>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-line font-mono text-[11px] uppercase tracking-tag text-ink/50">
              <th className="px-5 py-2">Job #</th>
              <th className="px-5 py-2">Client</th>
              <th className="px-5 py-2">Site</th>
              <th className="px-5 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {jobs === null && (
              <tr>
                <td colSpan={4} className="px-5 py-6 text-center text-sm text-ink/50">
                  Loading…
                </td>
              </tr>
            )}
            {jobs?.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-6 text-center text-sm text-ink/50">
                  No jobs yet. Create your first job from the Jobs tab.
                </td>
              </tr>
            )}
            {jobs?.slice(0, 8).map((job) => (
              <tr key={job.id} className="border-b border-line last:border-0 hover:bg-paper">
                <td className="px-5 py-3">
                  <Link href={`/jobs/${job.id}`} className="asset-tag">
                    {job.jobNumber}
                  </Link>
                </td>
                <td className="px-5 py-3 text-sm">{job.client?.companyName}</td>
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

function SummaryCard({ label, value, accent }: { label: string; value: number; accent: "amber" | "steel" | "rust" }) {
  const borderColor = { amber: "border-l-amber", steel: "border-l-steel", rust: "border-l-rust" }[accent];
  return (
    <div className={`card border-l-4 ${borderColor} px-5 py-4`}>
      <p className="font-mono text-[11px] uppercase tracking-tag text-ink/50">{label}</p>
      <p className="font-display text-4xl text-ink">{value}</p>
    </div>
  );
}
