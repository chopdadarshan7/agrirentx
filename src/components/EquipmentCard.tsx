import { Link } from "@tanstack/react-router";
import { Heart, MapPin, Star } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { inr } from "@/lib/data";
import { cn } from "@/lib/utils";
import type { Equipment, EquipmentCategoryRef } from "@/types/models";
import type { ReactNode } from "react";

const TONES = [
  "from-primary/25 to-primary/5",
  "from-info/25 to-info/5",
  "from-warning/25 to-warning/5",
  "from-success/25 to-success/5",
  "from-muted to-secondary",
];

export function toneFor(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return TONES[hash % TONES.length];
}

function categoryName(category: Equipment["category_id"]) {
  return typeof category === "string" || !category ? "" : (category as EquipmentCategoryRef).name;
}

export function EquipmentCard({
  item,
  footer,
  showStatus = true,
  isWishlisted,
  onToggleWishlist,
}: {
  item: Equipment;
  footer?: ReactNode;
  showStatus?: boolean;
  isWishlisted?: boolean;
  onToggleWishlist?: () => void;
}) {
  return (
    <article className="surface-card group flex flex-col overflow-hidden transition-shadow hover:shadow-md">
      <Link
        to="/equipment/$equipmentId"
        params={{ equipmentId: item._id }}
        className={cn(
          "relative flex h-40 items-end bg-gradient-to-br p-4 transition-transform duration-300",
          toneFor(item._id),
        )}
      >
        <span className="rounded-sm bg-card/85 px-2 py-1 text-xs font-medium">
          {categoryName(item.category_id)}
        </span>
        {showStatus ? (
          <span className="absolute right-3 top-3">
            <StatusBadge status={item.status} className="bg-card/90" />
          </span>
        ) : null}
        {onToggleWishlist ? (
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="absolute left-3 top-3 size-8 rounded-full bg-card/90 hover:bg-card"
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            onClick={(e) => {
              e.preventDefault();
              onToggleWishlist();
            }}
          >
            <Heart className={cn("size-4", isWishlisted && "fill-destructive text-destructive")} />
          </Button>
        ) : null}
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <Link
            to="/equipment/$equipmentId"
            params={{ equipmentId: item._id }}
            className="line-clamp-1 font-semibold hover:text-primary"
          >
            {item.title}
          </Link>
          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="size-3.5" />
            {item.location.district ?? item.location.address}
            {item.location.state ? `, ${item.location.state}` : ""}
          </p>
        </div>
        <div className="mt-auto flex items-end justify-between">
          <div>
            <p className="text-lg font-semibold">{inr(item.price_per_day)}</p>
            <p className="text-xs text-muted-foreground">per day</p>
          </div>
          <p className="flex items-center gap-1 text-sm">
            <Star className="size-4 fill-warning text-warning" />
            <span className="font-medium">{item.average_rating.toFixed(1)}</span>
            <span className="text-xs text-muted-foreground">({item.total_reviews})</span>
          </p>
        </div>
        {footer}
      </div>
    </article>
  );
}

export function EquipmentCardSkeleton() {
  return (
    <div className="surface-card overflow-hidden">
      <div className="h-40 animate-pulse bg-muted" />
      <div className="space-y-3 p-4">
        <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
        <div className="h-5 w-1/3 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}
