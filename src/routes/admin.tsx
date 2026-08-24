import { createFileRoute } from "@tanstack/react-router";
import {
  CalendarRange,
  CreditCard,
  LayoutDashboard,
  Megaphone,
  MessageSquare,
  ShieldCheck,
  Tractor,
  Users,
} from "lucide-react";
import { DashboardShell } from "@/components/DashboardShell";
import { requireAdmin } from "@/lib/route-guards";

export const Route = createFileRoute("/admin")({
  ssr: false,
  beforeLoad: ({ location }) => {
    requireAdmin(location);
  },
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <DashboardShell
      workspace="Admin console"
      notificationsHref="/admin"
      nav={[
        { to: "/admin", label: "Overview", icon: LayoutDashboard },
        { to: "/admin/rentalers", label: "Rentalers", icon: ShieldCheck },
        { to: "/admin/equipment", label: "Equipment", icon: Tractor },
        { to: "/admin/bookings", label: "Bookings", icon: CalendarRange },
        { to: "/admin/payments", label: "Payments", icon: CreditCard },
        { to: "/admin/reviews", label: "Reviews", icon: MessageSquare },
        { to: "/admin/users", label: "Users", icon: Users },
        { to: "/admin/broadcast", label: "Broadcast", icon: Megaphone },
      ]}
    />
  );
}
