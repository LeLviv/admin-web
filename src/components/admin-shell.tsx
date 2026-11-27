"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Menu, X } from "lucide-react";
import { ADMIN_NAV_ITEMS } from "@/config/navigation";
import { Button } from "@/components/ui/button";

export function AdminShell({
  username,
  children,
}: {
  username: string | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [signingOut, setSigningOut] = React.useState(false);

  const coreItems = ADMIN_NAV_ITEMS.filter((item) => item.section === "core");
  const extensibleItems = ADMIN_NAV_ITEMS.filter(
    (item) => item.section === "extensible"
  );

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.push("/login");
      router.refresh();
    }
  }

  function isActive(href: string) {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  }

  const navContent = (
    <div className="flex h-full flex-col justify-between p-4">
      <div className="space-y-6">
        <div className="px-2">
          <p className="text-sm font-semibold tracking-tight text-text">
            LeLviv Admin
          </p>
          <p className="text-xs text-text-muted">Operations Console</p>
        </div>

        <nav className="space-y-1" aria-label="Main navigation">
          {coreItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors ${
                  active
                    ? "bg-surface-muted font-medium text-text"
                    : "text-text-muted hover:bg-surface-muted/60 hover:text-text"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {extensibleItems.length > 0 ? (
          <div className="border-t border-border pt-4">
            <p className="mb-2 px-2.5 text-[11px] font-medium uppercase tracking-wider text-text-muted">
              Workspace
            </p>
            <nav className="space-y-1" aria-label="Extensible modules">
              {extensibleItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors ${
                      active
                        ? "bg-surface-muted font-medium text-text"
                        : "text-text-muted hover:bg-surface-muted/60 hover:text-text"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        ) : null}
      </div>

      <div className="border-t border-border pt-4">
        <div className="mb-3 px-2">
          <p className="truncate text-xs font-medium text-text">
            {username || "Administrator"}
          </p>
          <p className="text-[11px] text-text-muted">ADMIN</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start"
          onClick={handleSignOut}
          disabled={signingOut}
        >
          <LogOut className="h-4 w-4" />
          <span>{signingOut ? "Signing out..." : "Sign out"}</span>
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-bg">
      {/* Desktop sidebar */}
      <aside className="hidden w-56 shrink-0 border-r border-border bg-surface md:block">
        <div className="sticky top-0 h-screen">{navContent}</div>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative z-10 w-64 border-r border-border bg-surface">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-3 rounded-md p-1 text-text-muted hover:bg-surface-muted"
              aria-label="Close menu"
            >
              <X className="h-4 w-4" />
            </button>
            {navContent}
          </aside>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b border-border bg-surface px-4 md:hidden">
          <span className="text-sm font-semibold text-text">LeLviv Admin</span>
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="rounded-md p-1.5 text-text-muted hover:bg-surface-muted"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </header>

        <main className="mx-auto w-full max-w-5xl flex-1 p-5 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
