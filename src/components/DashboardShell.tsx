import { Link, Outlet, useNavigate } from "@tanstack/react-router";
import { Bell, ChevronsUpDown, LogOut, Sprout, Tractor, User } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { resolveUploadUrl } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useLogout } from "@/hooks/queries/use-auth";

export type NavItem = { to: string; label: string; icon: LucideIcon };

const ROLE_LABEL: Record<"admin" | "rentaler" | "farmer", string> = {
  admin: "Admin",
  rentaler: "Rentaler",
  farmer: "Farmer",
};

export function DashboardShell({
  workspace,
  nav,
  notificationsHref = "/farmer/notifications",
}: {
  workspace: string;
  nav: NavItem[];
  notificationsHref?: string;
}) {
  const { user } = useAuth();
  const logoutMutation = useLogout();
  const navigate = useNavigate();
  const name = user?.fullName ?? "";
  const role = user ? ROLE_LABEL[user.role] : "";
  const initials = name
    .split(" ")
    .map((p) => p[0] ?? "")
    .join("")
    .slice(0, 2);

  const canSwitchWorkspace = !!user?.is_farmer && !!user?.is_rentaler && user.rentaler_status === "approved";

  const handleLogout = () => {
    logoutMutation.mutate(undefined, { onSuccess: () => navigate({ to: "/" }) });
  };

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
              <Link to={notificationsHref}>
                <Bell className="size-4" />
              </Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-md p-1 pr-2 transition-colors hover:bg-muted"
                >
                  <Avatar className="size-8">
                    <AvatarImage src={resolveUploadUrl(user?.avatar)} alt={name} />
                    <AvatarFallback className="bg-accent text-xs text-accent-foreground">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden leading-tight sm:block">
                    <p className="text-sm font-medium">{name}</p>
                    <p className="text-xs text-muted-foreground">{role}</p>
                  </div>
                  {canSwitchWorkspace ? (
                    <ChevronsUpDown className="hidden size-3.5 text-muted-foreground sm:block" />
                  ) : null}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>{name}</DropdownMenuLabel>
                {canSwitchWorkspace ? (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/farmer" className="flex items-center gap-2">
                        <User className="size-4" />
                        Farmer dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/rentaler" className="flex items-center gap-2">
                        <Tractor className="size-4" />
                        Rentaler dashboard
                      </Link>
                    </DropdownMenuItem>
                  </>
                ) : null}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/farmer/profile" className="flex items-center gap-2">
                    <User className="size-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                  className="flex items-center gap-2 text-destructive focus:text-destructive"
                >
                  <LogOut className="size-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6">
        <aside className="hidden w-60 shrink-0 lg:block">
          <div className="sticky top-22 flex flex-col gap-4">
            <nav className="flex flex-col gap-1">
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
          </div>
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
