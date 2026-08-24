import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Menu, Sprout } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useAuth } from "@/contexts/AuthContext";
import { useLogout } from "@/hooks/queries/use-auth";

// The booking/payment flow is a critical transactional page — even though it
// shares this public header, translation stays off there (same reason it's
// off in dashboards: React's re-renders during checkout collide with the
// translate widget's DOM rewrites).
function useCanTranslate() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return !pathname.startsWith("/book/");
}

const nav = [{ to: "/equipment", label: "Browse equipment" }] as const;

function landingPathFor(user: { isAdmin: boolean; is_rentaler: boolean; rentaler_status: string }) {
  if (user.isAdmin) return "/admin";
  if (user.is_rentaler && user.rentaler_status === "approved") return "/rentaler";
  return "/farmer";
}

export function SiteHeader() {
  const { user, isAuthenticated } = useAuth();
  const logout = useLogout();
  const navigate = useNavigate();
  const canTranslate = useCanTranslate();

  const handleLogout = () => {
    logout.mutate(undefined, { onSuccess: () => navigate({ to: "/" }) });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Sprout className="size-4.5" />
          </span>
          AgriRentX
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              activeProps={{ className: "text-primary font-medium" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {canTranslate ? (
            <LanguageSwitcher className="h-9 w-auto gap-1.5 border-0 bg-transparent shadow-none hover:bg-accent" />
          ) : null}
          {isAuthenticated && user ? (
            <>
              <Button variant="ghost" asChild>
                <Link to={landingPathFor(user)}>Dashboard</Link>
              </Button>
              <Button variant="outline" onClick={handleLogout} disabled={logout.isPending}>
                Log out
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link to="/login">Log in</Link>
              </Button>
              <Button asChild>
                <Link to="/register">Create account</Link>
              </Button>
            </>
          )}
        </div>

        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="outline" size="icon" aria-label="Open menu">
              <Menu className="size-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72 p-6">
            <nav className="mt-8 flex flex-col gap-1">
              {nav.map((n) => (
                <Link key={n.to} to={n.to} className="rounded-md px-3 py-2 text-sm hover:bg-accent">
                  {n.label}
                </Link>
              ))}
              {canTranslate ? (
                <div className="px-3 py-2">
                  <LanguageSwitcher />
                </div>
              ) : null}
              {isAuthenticated && user ? (
                <>
                  <Link to={landingPathFor(user)} className="rounded-md px-3 py-2 text-sm hover:bg-accent">
                    Dashboard
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="rounded-md px-3 py-2 text-left text-sm hover:bg-accent"
                  >
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="rounded-md px-3 py-2 text-sm hover:bg-accent">
                    Log in
                  </Link>
                  <Link to="/register" className="rounded-md px-3 py-2 text-sm hover:bg-accent">
                    Create account
                  </Link>
                </>
              )}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-8 text-sm text-muted-foreground">
        <p>© 2026 AgriRentX — farm equipment rental marketplace.</p>
        <div className="flex gap-4">
          <Link to="/equipment" className="hover:text-foreground">
            Equipment
          </Link>
          <Link to="/login" className="hover:text-foreground">
            Log in
          </Link>
        </div>
      </div>
    </footer>
  );
}

export function PublicShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
