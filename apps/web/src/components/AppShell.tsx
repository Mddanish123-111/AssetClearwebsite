"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";
import { clearToken } from "@/lib/api";

const NAV = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/jobs", label: "Jobs" },
  { href: "/clients", label: "Clients" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined" && !window.localStorage.getItem("assetclear_token")) {
      router.replace("/login");
    }
  }, [router]);

  function handleLogout() {
    clearToken();
    router.push("/login");
  }

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-60 flex-col justify-between bg-ink px-5 py-6">
        <div>
          <div className="mb-8 flex items-baseline gap-1.5">
            <span className="font-display text-2xl uppercase tracking-wide text-paper">Asset</span>
            <span className="font-display text-2xl uppercase tracking-wide text-amber">Clear</span>
          </div>
          <nav className="space-y-1">
            {NAV.map((item) => {
              const active = pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    "block rounded-sm px-3 py-2 font-body text-sm transition",
                    active ? "bg-amber text-ink font-semibold" : "text-paper/70 hover:bg-white/5 hover:text-paper"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <button
          onClick={handleLogout}
          className="rounded-sm px-3 py-2 text-left font-body text-sm text-paper/50 transition hover:bg-white/5 hover:text-paper"
        >
          Sign out
        </button>
      </aside>
      <main className="flex-1 bg-paper px-10 py-8">{children}</main>
    </div>
  );
}
