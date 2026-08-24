import { createFileRoute, useParams } from "@tanstack/react-router";
import { EquipmentForm } from "@/components/EquipmentForm";
import { PageHeader } from "@/components/Primitives";
import { useAuth } from "@/contexts/AuthContext";
import { useMyEquipmentDetail } from "@/hooks/queries/use-equipment";

export const Route = createFileRoute("/rentaler/equipment/$equipmentId/edit")({
  head: () => ({
    meta: [
      { title: "Edit Equipment — AgriRentX" },
      { name: "description", content: "Update pricing, specs, photos and availability for your listing." },
      { property: "og:title", content: "Edit Equipment — AgriRentX" },
      { property: "og:description", content: "Keep your listing details accurate and bookable." },
    ],
  }),
  component: EditEquipmentPage,
});

function EditEquipmentPage() {
  const { equipmentId } = useParams({ from: "/rentaler/equipment/$equipmentId/edit" });
  const { user } = useAuth();
  const { data: equipment, isLoading } = useMyEquipmentDetail(user?._id, equipmentId);

  if (isLoading) return null;
  if (!equipment) {
    return (
      <div className="space-y-6">
        <PageHeader title="Listing not found" description="This equipment isn't in your account." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title={`Edit ${equipment.title}`} description="Changes are re-reviewed before going live." />
      <EquipmentForm equipment={equipment} />
    </div>
  );
}
