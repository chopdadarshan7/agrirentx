import { createFileRoute } from "@tanstack/react-router";
import { EquipmentForm } from "@/components/EquipmentForm";
import { PageHeader } from "@/components/Primitives";

export const Route = createFileRoute("/rentaler/equipment/new")({
  head: () => ({
    meta: [
      { title: "Add Equipment — AgriRentX" },
      { name: "description", content: "List a tractor, harvester or implement for rent across your district." },
      { property: "og:title", content: "Add Equipment — AgriRentX" },
      { property: "og:description", content: "List your machine and start earning between seasons." },
    ],
  }),
  component: AddEquipmentPage,
});

function AddEquipmentPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Add equipment"
        description="Listings go live after admin verification, usually within two working days."
      />
      <EquipmentForm />
    </div>
  );
}
