import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SearchX, SlidersHorizontal } from "lucide-react";
import { PublicShell } from "@/components/SiteHeader";
import { EquipmentCard, EquipmentCardSkeleton } from "@/components/EquipmentCard";
import { EmptyState, PageHeader } from "@/components/Primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { categories, equipments, inr } from "@/lib/data";

type Search = { category: string };

export const Route = createFileRoute("/equipment/")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    category: typeof search["category"] === "string" ? search["category"] : "all",
  }),
  head: () => ({
    meta: [
      { title: "Browse Farm Equipment for Rent — AgriRentX" },
      {
        name: "description",
        content:
          "Filter tractors, harvesters, tillage and irrigation equipment by district, category and daily price.",
      },
      { property: "og:title", content: "Browse Farm Equipment for Rent — AgriRentX" },
      {
        property: "og:description",
        content: "Search verified farm machinery available for daily rental near you.",
      },
    ],
  }),
  component: EquipmentListPage,
});

const states = ["All states", "Maharashtra", "Punjab", "Madhya Pradesh", "Andhra Pradesh", "Karnataka", "Haryana", "Gujarat"];

function EquipmentListPage() {
  const { category } = Route.useSearch();
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState(category ?? "all");
  const [state, setState] = useState("All states");
  const [maxPrice, setMaxPrice] = useState(12000);
  const [loading] = useState(false);

  const results = useMemo(
    () =>
      equipments.filter(
        (e) =>
          e.approvalStatus === "approved" &&
          (cat === "all" || e.category === cat) &&
          (state === "All states" || e.state === state) &&
          e.pricePerDay <= maxPrice &&
          (query === "" ||
            `${e.title} ${e.district} ${e.categoryName}`.toLowerCase().includes(query.toLowerCase())),
      ),
    [cat, state, maxPrice, query],
  );

  const clear = () => {
    setQuery("");
    setCat("all");
    setState("All states");
    setMaxPrice(12000);
  };

  return (
    <PublicShell>
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-10">
        <PageHeader
          title="Equipment near you"
          description={`${results.length} machines match your filters`}
        />

        <div className="surface-card grid gap-4 p-4 md:grid-cols-4">
          <Input
            placeholder="Search equipment or district"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search equipment"
          />
          <Select value={cat} onValueChange={setCat}>
            <SelectTrigger aria-label="Category">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.slug} value={c.slug}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={state} onValueChange={setState}>
            <SelectTrigger aria-label="State">
              <SelectValue placeholder="State" />
            </SelectTrigger>
            <SelectContent>
              {states.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="space-y-2">
            <p className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <SlidersHorizontal className="size-3.5" /> Max per day
              </span>
              <span className="font-medium text-foreground">{inr(maxPrice)}</span>
            </p>
            <Slider
              value={[maxPrice]}
              min={500}
              max={12000}
              step={100}
              onValueChange={(v) => setMaxPrice(v[0] ?? 12000)}
              aria-label="Maximum daily price"
            />
          </div>
        </div>

        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <EquipmentCardSkeleton key={i} />
            ))}
          </div>
        ) : results.length === 0 ? (
          <EmptyState
            icon={<SearchX className="size-5" />}
            title="No equipment matches these filters"
            message="Try widening the price range or removing the district filter — there may be machines just outside your current selection."
            action={
              <Button variant="outline" onClick={clear}>
                Clear all filters
              </Button>
            }
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((item) => (
              <EquipmentCard key={item.id} item={item} />
            ))}
          </div>
        )}

        <nav className="flex items-center justify-between border-t border-border pt-5 text-sm">
          <p className="text-muted-foreground">
            Showing 1–{results.length} of {results.length}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled>
              Next
            </Button>
          </div>
        </nav>

        <p className="text-sm text-muted-foreground">
          Own equipment?{" "}
          <Link to="/rentaler/equipment/new" className="font-medium text-primary hover:underline">
            List it on AgriRentX
          </Link>
        </p>
      </div>
    </PublicShell>
  );
}
