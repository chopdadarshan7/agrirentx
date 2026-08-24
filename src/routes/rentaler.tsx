import { createFileRoute } from "@tanstack/react-router";
import { BarChart3, CalendarRange, LayoutDashboard, PlusCircle, Tractor, Truck } from "lucide-react";
import { DashboardShell } from "@/components/DashboardShell";
import { requireApprovedRentaler } from "@/lib/route-guards";

export const Route = createFileRoute("/rentaler")({
  ssr: false,
  beforeLoad: ({ location }) => {
    requireApprovedRentaler(location);
  },
  component: RentalerLayout,
});

function RentalerLayout() {
  return (
    <DashboardShell
      workspace="Rentaler workspace"
      notificationsHref="/farmer/notifications"
      nav={[
        { to: "/rentaler", label: "Dashboard", icon: LayoutDashboard },
        { to: "/rentaler/equipment", label: "My equipment", icon: Tractor },
        { to: "/rentaler/equipment/new", label: "Add equipment", icon: PlusCircle },
        { to: "/rentaler/bookings", label: "Bookings received", icon: CalendarRange },
        { to: "/rentaler/eqtrack", label: "EqTrack", icon: Truck },
        { to: "/rentaler/analytics", label: "Analytics", icon: BarChart3 },
      ]}
    />
  );
}
