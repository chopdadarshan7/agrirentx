import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, HeartOff } from "lucide-react";
import { EmptyState, PageHeader } from "@/components/Primitives";
import { EquipmentCard } from "@/components/EquipmentCard";
import { Button } from "@/components/ui/button";
import { equipments } from "@/lib/data";
import { useState } from "react";

export const Route = createFileRoute("/farmer/wishlist")({
  head: () => ({
    meta: [
      { title: "Wishlist — AgriRentX" },
      { name: "description", content: "Equipment you saved while browsing, ready to book later." },
      { property: "og:title", content: "Wishlist — AgriRentX" },
      { property: "og:description", content: "Your saved farm equipment on AgriRentX." },
    ],
  }),
  component: WishlistPage,
});

function WishlistPage() {
  const [saved, setSaved] = useState(["eq-1001", "eq-1003", "eq-1006"]);
  const list = equipments.filter((e) => saved.includes(e.id));

  return (
    <div className="space-y-6">
      <PageHeader title="Wishlist" description="Saved equipment, kept for when the season turns." />

      {list.length === 0 ? (
        <EmptyState
          icon={<Heart className="size-5" />}
          title="Your wishlist is empty"
          message="Save equipment while browsing to find it here later."
          action={
            <Button asChild>
              <Link to="/equipment">Browse equipment</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((item) => (
            <EquipmentCard
              key={item.id}
              item={item}
              footer={
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => setSaved((s) => s.filter((id) => id !== item.id))}
                >
                  <HeartOff className="size-4" />
                  Remove from wishlist
                </Button>
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
