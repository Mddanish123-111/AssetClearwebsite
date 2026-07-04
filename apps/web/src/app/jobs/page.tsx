"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { StatusChip } from "@/components/StatusChip";
import { api } from "@/lib/api";

export default function JobsPage() {
  const [jobs, setJobs] = useState<any[] | null>(null);

  useEffect(() => {
    api.listJobs().then(setJobs).catch(() => setJobs([]));
  }, []);

  return (
    <AppShell>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="h-page">Jobs</h1>
        <Link href="/jobs/new" className="btn-primary">
          + New job
        </Link>
      </div>

      <div className="card">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-line font-mono text-[11px] uppercase tracking-tag text-ink/50">
              <th className="px-5 py-2">Job #</th>
              <th className="px-5 py-2">Client</th>
              <th className="px-5 py-2">Site</th>
              <th className="px-5 py-2">Assets logged</th>
              <th className="px-5 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {jobs === null && (
              <tr>
                <td colSpan={5} className="px-5 py-6 text-center text-sm text-ink/50">
                  Loading…
                </td>
              </tr>
            )}
            {jobs?.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-6 text-center text-sm text-ink/50">
                  No jobs yet.{" "}
                  <Link href="/jobs/new" className="text-steel hover:underline">
                    Create one
                  </Link>
                  .
                </td>
              </tr>
            )}
            {jobs?.map((job) => (
              <tr key={job.id} className="border-b border-line last:border-0 hover:bg-paper">
                <td className="px-5 py-3">
                  <Link href={`/jobs/${job.id}`} className="asset-tag">
                    {job.jobNumber}
                  </Link>
                </td>
                <td className="px-5 py-3 text-sm">{job.client?.companyName}</td>
                <td className="px-5 py-3 text-sm text-ink/70">{job.siteAddress}</td>
                <td className="px-5 py-3 text-sm">{job._count?.assets ?? 0}</td>
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
