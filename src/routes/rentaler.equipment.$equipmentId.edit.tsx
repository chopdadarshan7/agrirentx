import { createFileRoute, notFound, useParams } from "@tanstack/react-router";
import { EquipmentForm } from "@/components/EquipmentForm";
import { PageHeader } from "@/components/Primitives";
import { equipments } from "@/lib/data";

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
  const equipment = equipments.find((e) => e.id === equipmentId);
  if (!equipment) throw notFound();

  return (
    <div className="space-y-6">
      <PageHeader title={`Edit ${equipment.title}`} description="Changes are re-reviewed before going live." />
      <EquipmentForm equipment={equipment} />
    </div>
  );
}
