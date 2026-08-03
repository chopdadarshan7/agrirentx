import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Search, ShieldCheck, Tractor, Wallet } from "lucide-react";
import { PublicShell } from "@/components/SiteHeader";
import { EquipmentCard } from "@/components/EquipmentCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { categories, equipments } from "@/lib/data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AgriRentX — Rent Farm Equipment Near You" },
      {
        name: "description",
        content:
          "Rent tractors, harvesters, rotavators and irrigation gear from verified owners nearby. Transparent daily pricing, instant booking, secure payments.",
      },
      { property: "og:title", content: "AgriRentX — Rent Farm Equipment Near You" },
      {
        property: "og:description",
        content: "Book verified farm equipment by the day from owners in your district.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const featured = equipments.filter((e) => e.approvalStatus === "approved").slice(0, 6);

  return (
    <PublicShell>
      <section className="border-b border-border bg-gradient-to-b from-accent/60 to-background">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
          <div className="max-w-2xl animate-fade-in-up">
            <span className="inline-flex items-center gap-2 rounded-sm border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
              <ShieldCheck className="size-3.5 text-primary" />
              Verified owners in 240+ districts
            </span>
            <h1 className="mt-5 text-4xl font-semibold leading-tight sm:text-5xl">
              Rent the right machine for this season, from a farmer nearby.
            </h1>
            <p className="mt-4 text-base text-muted-foreground sm:text-lg">
              Tractors, harvesters, seed drills and irrigation sets — booked by the day, paid
              securely, delivered on your field schedule.
            </p>

            <form
              className="mt-8 flex flex-col gap-2 sm:flex-row"
              onSubmit={(e) => e.preventDefault()}
            >
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search nearby equipment — e.g. 45 HP tractor, Nashik"
                  className="h-12 bg-card pl-9"
                  aria-label="Search nearby equipment"
                />
              </div>
              <Button size="lg" className="h-12" asChild>
                <Link to="/equipment">
                  Search nearby equipment
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </form>

            <dl className="mt-10 grid grid-cols-3 gap-6 border-t border-border pt-6 text-sm">
              <div>
                <dt className="text-muted-foreground">Listings live</dt>
                <dd className="text-xl font-semibold">4,380</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Avg. booking time</dt>
                <dd className="text-xl font-semibold">6 min</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Owner payout</dt>
                <dd className="text-xl font-semibold">48 hrs</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="text-2xl font-semibold">Browse by category</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Every listing is document-verified before it goes live.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <Link
              key={c.slug}
              to="/equipment"
              search={{ category: c.slug }}
              className="surface-card group flex items-start gap-4 p-5 transition-shadow hover:shadow-md"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
                <Tractor className="size-5" />
              </span>
              <div>
                <p className="font-medium group-hover:text-primary">{c.name}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">{c.description}</p>
                <p className="mt-2 text-xs text-muted-foreground">{c.count} listings</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-14">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold">Featured equipment</h2>
            <p className="mt-1 text-sm text-muted-foreground">Highest rated machines this month.</p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/equipment">View all</Link>
          </Button>
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((item) => (
            <EquipmentCard key={item.id} item={item} showStatus={false} />
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-card">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6 px-4 py-14">
          <div className="max-w-xl">
            <h2 className="text-2xl font-semibold">Own a tractor that sits idle?</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              List it once, get verified, and earn from every idle week. Payouts settle within 48
              hours of rental completion.
            </p>
          </div>
          <div className="flex gap-3">
            <Button size="lg" asChild>
              <Link to="/rentaler/equipment/new">
                <Wallet className="size-4" />
                Rent out your equipment
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
