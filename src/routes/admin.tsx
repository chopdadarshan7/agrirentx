import { createFileRoute } from "@tanstack/react-router";
import {
  CalendarRange,
  CreditCard,
  LayoutDashboard,
  MessageSquare,
  ShieldCheck,
  Tractor,
  Users,
} from "lucide-react";
import { DashboardShell } from "@/components/DashboardShell";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <DashboardShell
      workspace="Admin console"
      user={{ name: "Platform Admin", role: "Administrator" }}
      nav={[
        { to: "/admin", label: "Overview", icon: LayoutDashboard },
        { to: "/admin/rentalers", label: "Rentalers", icon: ShieldCheck },
        { to: "/admin/equipment", label: "Equipment", icon: Tractor },
        { to: "/admin/bookings", label: "Bookings", icon: CalendarRange },
        { to: "/admin/payments", label: "Payments", icon: CreditCard },
        { to: "/admin/reviews", label: "Reviews", icon: MessageSquare },
        { to: "/admin/users", label: "Users", icon: Users },
      ]}
    />
  );
}
