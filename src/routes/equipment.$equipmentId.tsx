import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { CalendarDays, MapPin, ShieldCheck, Star } from "lucide-react";
import { PublicShell } from "@/components/SiteHeader";
import { EquipmentCard } from "@/components/EquipmentCard";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { equipments, getEquipment, inr, reviews } from "@/lib/data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/equipment/$equipmentId")({
  loader: ({ params }) => {
    const item = getEquipment(params.equipmentId);
    if (!item) throw notFound();
    return { item };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Equipment not found — AgriRentX" }, { name: "robots", content: "noindex" }],
      };
    }
    const { item } = loaderData;
    const title = `${item.title} — rent for ${inr(item.pricePerDay)}/day | AgriRentX`;
    const description = `${item.categoryName} available in ${item.district}, ${item.state}. ${item.description.slice(0, 110)}`;
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
  const itemReviews = reviews.filter((r) => r.equipmentId === item.id && !r.hidden);
  const related = equipments
    .filter((e) => e.category === item.category && e.id !== item.id && e.approvalStatus === "approved")
    .slice(0, 3);

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
            <div className={cn("h-72 rounded-md bg-gradient-to-br", item.tone)} />
            <div className="grid grid-cols-4 gap-3">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className={cn("h-20 rounded-md bg-gradient-to-br opacity-70", item.tone)} />
              ))}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-semibold sm:text-3xl">{item.title}</h1>
                <StatusBadge status={item.status} />
              </div>
              <p className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="size-4" /> {item.district}, {item.state}
                </span>
                <span className="flex items-center gap-1">
                  <Star className="size-4 fill-warning text-warning" /> {item.rating} ·{" "}
                  {item.reviewCount} reviews
                </span>
              </p>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
            </div>

            <section className="surface-card overflow-hidden">
              <h2 className="border-b border-border px-5 py-3 text-sm font-semibold">
                Specifications
              </h2>
              <dl className="divide-y divide-border">
                {item.specs.map((s: { label: string; value: string }) => (
                  <div key={s.label} className="flex justify-between gap-4 px-5 py-3 text-sm">
                    <dt className="text-muted-foreground">{s.label}</dt>
                    <dd className="font-medium">{s.value}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Reviews</h2>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/review/$equipmentId" params={{ equipmentId: item.id }}>
                    See all reviews
                  </Link>
                </Button>
              </div>
              {itemReviews.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No reviews yet — be the first after your rental completes.
                </p>
              ) : (
                itemReviews.map((r) => (
                  <article key={r.id} className="surface-card p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{r.author}</p>
                      <span className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "size-3.5",
                              i < r.rating ? "fill-warning text-warning" : "text-border",
                            )}
                          />
                        ))}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{r.comment}</p>
                    <p className="mt-2 text-xs text-muted-foreground">{r.date}</p>
                  </article>
                ))
              )}
            </section>
          </div>

          <aside className="lg:sticky lg:top-22 lg:self-start">
            <div className="surface-card space-y-4 p-5 shadow-md">
              <div>
                <p className="text-3xl font-semibold">{inr(item.pricePerDay)}</p>
                <p className="text-sm text-muted-foreground">per day · excludes fuel</p>
              </div>
              <Separator />
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Refundable deposit</dt>
                  <dd className="font-medium">{inr(item.deposit)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Listed by</dt>
                  <dd className="font-medium">{item.owner}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Approval</dt>
                  <dd>
                    <StatusBadge status={item.approvalStatus} />
                  </dd>
                </div>
              </dl>
              <p className="flex items-start gap-2 rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
                <CalendarDays className="mt-0.5 size-4 shrink-0" />
                Next available window: 12 Aug – 30 Sep 2026. Exact dates are picked at checkout.
              </p>
              <Button className="w-full" size="lg" asChild disabled={item.status !== "available"}>
                <Link to="/book/$equipmentId" params={{ equipmentId: item.id }}>
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
                <EquipmentCard key={r.id} item={r} showStatus={false} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </PublicShell>
  );
}
