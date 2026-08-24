import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, HeartOff } from "lucide-react";
import { EmptyState, PageHeader } from "@/components/Primitives";
import { EquipmentCard } from "@/components/EquipmentCard";
import { Button } from "@/components/ui/button";
import { useWishlist, useRemoveFromWishlist } from "@/hooks/queries/use-wishlist";

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
  const { data: items = [] } = useWishlist();
  const removeFromWishlist = useRemoveFromWishlist();

  return (
    <div className="space-y-6">
      <PageHeader title="Wishlist" description="Saved equipment, kept for when the season turns." />

      {items.length === 0 ? (
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
          {items.map((entry) => (
            <EquipmentCard
              key={entry._id}
              item={entry.equipment_id}
              footer={
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => removeFromWishlist.mutate(entry.equipment_id._id)}
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
