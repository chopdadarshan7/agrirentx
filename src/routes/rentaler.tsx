import { createFileRoute } from "@tanstack/react-router";
import { BarChart3, CalendarRange, LayoutDashboard, PlusCircle, Tractor } from "lucide-react";
import { DashboardShell } from "@/components/DashboardShell";

export const Route = createFileRoute("/rentaler")({
  component: RentalerLayout,
});

function RentalerLayout() {
  return (
    <DashboardShell
      workspace="Rentaler workspace"
      user={{ name: "Rajesh Patil", role: "Approved rentaler" }}
      nav={[
        { to: "/rentaler", label: "Dashboard", icon: LayoutDashboard },
        { to: "/rentaler/equipment", label: "My equipment", icon: Tractor },
        { to: "/rentaler/equipment/new", label: "Add equipment", icon: PlusCircle },
        { to: "/rentaler/bookings", label: "Bookings received", icon: CalendarRange },
        { to: "/rentaler/analytics", label: "Analytics", icon: BarChart3 },
      ]}
    />
  );
}
