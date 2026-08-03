import { createFileRoute } from "@tanstack/react-router";
import { Bell, CreditCard, Heart, LayoutDashboard, Package, User } from "lucide-react";
import { DashboardShell } from "@/components/DashboardShell";

export const Route = createFileRoute("/farmer")({
  component: FarmerLayout,
});

function FarmerLayout() {
  return (
    <DashboardShell
      workspace="Farmer workspace"
      user={{ name: "Aarti Deshmukh", role: "Farmer" }}
      nav={[
        { to: "/farmer", label: "Dashboard", icon: LayoutDashboard },
        { to: "/farmer/bookings", label: "My bookings", icon: Package },
        { to: "/farmer/wishlist", label: "Wishlist", icon: Heart },
        { to: "/farmer/payments", label: "Payment history", icon: CreditCard },
        { to: "/farmer/notifications", label: "Notifications", icon: Bell },
        { to: "/farmer/profile", label: "Profile", icon: User },
      ]}
    />
  );
}
