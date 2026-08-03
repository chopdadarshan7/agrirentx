import { Link } from "@tanstack/react-router";
import { MapPin, Star } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { inr, type Equipment } from "@/lib/data";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function EquipmentCard({
  item,
  footer,
  showStatus = true,
}: {
  item: Equipment;
  footer?: ReactNode;
  showStatus?: boolean;
}) {
  return (
    <article className="surface-card group flex flex-col overflow-hidden transition-shadow hover:shadow-md">
      <Link
        to="/equipment/$equipmentId"
        params={{ equipmentId: item.id }}
        className={cn(
          "relative flex h-40 items-end bg-gradient-to-br p-4 transition-transform duration-300",
          item.tone,
        )}
      >
        <span className="rounded-sm bg-card/85 px-2 py-1 text-xs font-medium">
          {item.categoryName}
        </span>
        {showStatus ? (
          <span className="absolute right-3 top-3">
            <StatusBadge status={item.status} className="bg-card/90" />
          </span>
        ) : null}
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <Link
            to="/equipment/$equipmentId"
            params={{ equipmentId: item.id }}
            className="line-clamp-1 font-semibold hover:text-primary"
          >
            {item.title}
          </Link>
          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="size-3.5" />
            {item.district}, {item.state}
          </p>
        </div>
        <div className="mt-auto flex items-end justify-between">
          <div>
            <p className="text-lg font-semibold">{inr(item.pricePerDay)}</p>
            <p className="text-xs text-muted-foreground">per day</p>
          </div>
          <p className="flex items-center gap-1 text-sm">
            <Star className="size-4 fill-warning text-warning" />
            <span className="font-medium">{item.rating}</span>
            <span className="text-xs text-muted-foreground">({item.reviewCount})</span>
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
