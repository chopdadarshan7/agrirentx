import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { CalendarDays, MapPin, ShieldCheck, Star } from "lucide-react";
import { PublicShell } from "@/components/SiteHeader";
import { EquipmentCard, toneFor } from "@/components/EquipmentCard";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { inr } from "@/lib/data";
import { cn } from "@/lib/utils";
import { qk } from "@/lib/query-keys";
import { getEquipment } from "@/lib/api/equipment";
import { useEquipmentList } from "@/hooks/queries/use-equipment";
import { useEquipmentReviews } from "@/hooks/queries/use-reviews";
import { useWishlistCheck, useAddToWishlist, useRemoveFromWishlist } from "@/hooks/queries/use-wishlist";
import { useEquipmentAvailability } from "@/hooks/queries/use-availability";
import { useAuth } from "@/contexts/AuthContext";
import type { EquipmentCategoryRef, EquipmentRentalerRef } from "@/types/models";

export const Route = createFileRoute("/equipment/$equipmentId")({
  loader: async ({ params, context }) => {
    try {
      const item = await context.queryClient.ensureQueryData({
        queryKey: qk.equipmentDetail(params.equipmentId),
        queryFn: () => getEquipment(params.equipmentId),
      });
      return { item };
    } catch {
      throw notFound();
    }
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Equipment not found — AgriRentX" }, { name: "robots", content: "noindex" }],
      };
    }
    const { item } = loaderData;
    const district = item.location.district ?? item.location.address;
    const title = `${item.title} — rent for ${inr(item.price_per_day)}/day | AgriRentX`;
    const description = `Available in ${district}, ${item.location.state ?? ""}. ${item.description.slice(0, 110)}`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: EquipmentDetailsPage,
});

function EquipmentDetailsPage() {
  const { item } = Route.useLoaderData();
  const { isAuthenticated, user } = useAuth();
  const { data: itemReviews = [] } = useEquipmentReviews(item._id);
  const { data: relatedData } = useEquipmentList({
    category: typeof item.category_id === "string" ? item.category_id : item.category_id?._id,
    limit: 4,
  });
  const related = (relatedData?.items ?? []).filter((e) => e._id !== item._id).slice(0, 3);

  const canWishlist = isAuthenticated && !!user?.is_farmer;
  const { data: isWishlisted } = useWishlistCheck(canWishlist ? item._id : undefined);
  const addToWishlist = useAddToWishlist();
  const removeFromWishlist = useRemoveFromWishlist();

  const { data: availabilityBlocks } = useEquipmentAvailability(isAuthenticated ? item._id : undefined);
  const blockedRanges = (availabilityBlocks ?? []).filter((b) => b.status !== "available");

  const rentaler = typeof item.rentaler_id === "string" ? null : (item.rentaler_id as EquipmentRentalerRef);
  const category = typeof item.category_id === "string" ? null : (item.category_id as EquipmentCategoryRef);
  const tone = toneFor(item._id);

  return (
    <PublicShell>
      <div className="mx-auto max-w-6xl space-y-10 px-4 py-10">
        <nav className="text-sm text-muted-foreground">
          <Link to="/equipment" className="hover:text-foreground">
            Equipment
          </Link>
          <span className="px-2">/</span>
          <span className="text-foreground">{item.title}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
          <div className="space-y-6">
            <div className={cn("h-72 rounded-md bg-gradient-to-br", tone)} />
            <div className="grid grid-cols-4 gap-3">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className={cn("h-20 rounded-md bg-gradient-to-br opacity-70", tone)} />
              ))}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-semibold sm:text-3xl">{item.title}</h1>
                <StatusBadge status={item.status} />
                {category ? <span className="text-sm text-muted-foreground">{category.name}</span> : null}
              </div>
              <p className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="size-4" /> {item.location.district ?? item.location.address}
                  {item.location.state ? `, ${item.location.state}` : ""}
                </span>
                <span className="flex items-center gap-1">
                  <Star className="size-4 fill-warning text-warning" /> {item.average_rating.toFixed(1)} ·{" "}
                  {item.total_reviews} reviews
                </span>
              </p>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
            </div>

            {item.specifications && Object.keys(item.specifications).length > 0 ? (
              <section className="surface-card overflow-hidden">
                <h2 className="border-b border-border px-5 py-3 text-sm font-semibold">Specifications</h2>
                <dl className="divide-y divide-border">
                  {Object.entries(item.specifications).map(([label, value]) => (
                    <div key={label} className="flex justify-between gap-4 px-5 py-3 text-sm">
                      <dt className="text-muted-foreground">{label}</dt>
                      <dd className="font-medium">{value}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            ) : null}

            <section id="reviews" className="space-y-4 scroll-mt-24">
              <h2 className="text-lg font-semibold">Reviews</h2>
              {itemReviews.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No reviews yet — be the first after your rental completes.
                </p>
              ) : (
                itemReviews.map((r) => {
                  const author = typeof r.farmer_id === "string" ? "Farmer" : r.farmer_id.fullName;
                  return (
                    <article key={r._id} className="surface-card p-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{author}</p>
                        <span className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={cn("size-3.5", i < r.rating ? "fill-warning text-warning" : "text-border")}
                            />
                          ))}
                        </span>
                      </div>
                      {r.review ? <p className="mt-2 text-sm text-muted-foreground">{r.review}</p> : null}
                      <p className="mt-2 text-xs text-muted-foreground">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </p>
                    </article>
                  );
                })
              )}
            </section>
          </div>

          <aside className="lg:sticky lg:top-22 lg:self-start">
            <div className="surface-card space-y-4 p-5 shadow-md">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-3xl font-semibold">{inr(item.price_per_day)}</p>
                  <p className="text-sm text-muted-foreground">per day · excludes fuel</p>
                </div>
                {canWishlist ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      isWishlisted ? removeFromWishlist.mutate(item._id) : addToWishlist.mutate(item._id)
                    }
                  >
                    {isWishlisted ? "Saved" : "Save"}
                  </Button>
                ) : null}
              </div>
              <Separator />
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Refundable deposit</dt>
                  <dd className="font-medium">{inr(item.security_deposit)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Listed by</dt>
                  <dd className="font-medium">{rentaler?.fullName ?? "AgriRentX partner"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Approval</dt>
                  <dd>
                    <StatusBadge status={item.approval_status} />
                  </dd>
                </div>
              </dl>
              {blockedRanges.length > 0 ? (
                <div className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
                  <p className="flex items-center gap-2 font-medium text-foreground">
                    <CalendarDays className="size-4 shrink-0" />
                    Unavailable dates
                  </p>
                  <ul className="mt-1.5 space-y-1">
                    {blockedRanges.map((b) => (
                      <li key={b._id}>
                        {new Date(b.start_date).toLocaleDateString()} –{" "}
                        {new Date(b.end_date).toLocaleDateString()}
                        {b.reason ? ` · ${b.reason}` : ""}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="flex items-start gap-2 rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
                  <CalendarDays className="mt-0.5 size-4 shrink-0" />
                  Pick your dates at checkout — availability is checked in real time.
                </p>
              )}
              <Button className="w-full" size="lg" asChild disabled={item.status !== "available"}>
                <Link to="/book/$equipmentId" params={{ equipmentId: item._id }}>
                  Book now
                </Link>
              </Button>
              <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <ShieldCheck className="size-3.5 text-primary" />
                Payment held securely until the rental starts
              </p>
            </div>
          </aside>
        </div>

        {related.length > 0 ? (
          <section>
            <h2 className="text-lg font-semibold">Similar equipment nearby</h2>
            <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r) => (
                <EquipmentCard key={r._id} item={r} showStatus={false} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </PublicShell>
  );
}
