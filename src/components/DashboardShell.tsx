import { Link, Outlet } from "@tanstack/react-router";
import { Bell, Sprout } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export type NavItem = { to: string; label: string; icon: LucideIcon };

export function DashboardShell({
  workspace,
  nav,
  user,
}: {
  workspace: string;
  nav: NavItem[];
  user: { name: string; role: string };
}) {
  const initials = user.name
    .split(" ")
    .map((p) => p[0] ?? "")
    .join("")
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-card">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 font-semibold">
              <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Sprout className="size-4.5" />
              </span>
              AgriRentX
            </Link>
            <span className="hidden rounded-sm bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground sm:inline">
              {workspace}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" aria-label="Notifications" asChild>
              <Link to="/farmer/notifications">
                <Bell className="size-4" />
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <Avatar className="size-8">
                <AvatarFallback className="bg-accent text-xs text-accent-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden leading-tight sm:block">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.role}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6">
        <aside className="hidden w-60 shrink-0 lg:block">
          <nav className="sticky top-22 flex flex-col gap-1">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.to.split("/").length === 2 }}
                activeProps={{ className: "bg-accent text-accent-foreground font-medium" }}
                className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <div className="min-w-0 flex-1 space-y-6 pb-12">
          <div className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-2 lg:hidden">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.to.split("/").length === 2 }}
                activeProps={{ className: "bg-accent text-accent-foreground" }}
                className="whitespace-nowrap rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground"
              >
                {item.label}
              </Link>
            ))}
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
