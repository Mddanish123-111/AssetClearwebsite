"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { api } from "@/lib/api";

export default function ClientsPage() {
  const [clients, setClients] = useState<any[] | null>(null);

  useEffect(() => {
    api.listClients().then(setClients).catch(() => setClients([]));
  }, []);

  return (
    <AppShell>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="h-page">Clients</h1>
        <Link href="/clients/new" className="btn-primary">
          + New client
        </Link>
      </div>

      <div className="card">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-line font-mono text-[11px] uppercase tracking-tag text-ink/50">
              <th className="px-5 py-2">Company</th>
              <th className="px-5 py-2">Billing email</th>
              <th className="px-5 py-2">Jobs</th>
            </tr>
          </thead>
          <tbody>
            {clients === null && (
              <tr>
                <td colSpan={3} className="px-5 py-6 text-center text-sm text-ink/50">
                  Loading…
                </td>
              </tr>
            )}
            {clients?.length === 0 && (
              <tr>
                <td colSpan={3} className="px-5 py-6 text-center text-sm text-ink/50">
                  No clients yet.{" "}
                  <Link href="/clients/new" className="text-steel hover:underline">
                    Add one
                  </Link>
                  .
                </td>
              </tr>
            )}
            {clients?.map((c) => (
              <tr key={c.id} className="border-b border-line last:border-0 hover:bg-paper">
                <td className="px-5 py-3 text-sm font-medium">
                  <Link href={`/clients/${c.id}`} className="hover:underline">
                    {c.companyName}
                  </Link>
                </td>
                <td className="px-5 py-3 text-sm text-ink/70">{c.billingEmail}</td>
                <td className="px-5 py-3 text-sm">{c._count?.jobs ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
