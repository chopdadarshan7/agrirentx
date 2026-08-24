import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, LocateFixed, Search, SearchX, SlidersHorizontal, X } from "lucide-react";
import { toast } from "sonner";
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
import { inr } from "@/lib/data";
import { cn } from "@/lib/utils";
import { getCurrentPosition } from "@/lib/geolocation";
import { useCategories } from "@/hooks/queries/use-categories";
import { useEquipmentList, useNearbyEquipment } from "@/hooks/queries/use-equipment";

type Search = { category?: string | undefined; search?: string | undefined };

export const Route = createFileRoute("/equipment/")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    ...(typeof search["category"] === "string" ? { category: search["category"] } : {}),
    ...(typeof search["search"] === "string" ? { search: search["search"] } : {}),
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
const MAX_PRICE_CEILING = 12000;

function EquipmentListPage() {
  const { category, search: initialSearch } = Route.useSearch();
  const { data: categories } = useCategories();
  const [queryInput, setQueryInput] = useState(initialSearch ?? "");
  const [search, setSearch] = useState(initialSearch ?? "");
  const [cat, setCat] = useState(category ?? "all");
  const [state, setState] = useState("All states");
  const [maxPrice, setMaxPrice] = useState(MAX_PRICE_CEILING);
  const [page, setPage] = useState(1);
  const [nearMe, setNearMe] = useState<{ latitude: number; longitude: number } | null>(null);
  const [detectingNear, setDetectingNear] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(queryInput);
      setPage(1);
    }, 350);
    return () => clearTimeout(timeout);
  }, [queryInput]);

  const { data, isLoading } = useEquipmentList({
    search: search || undefined,
    category: cat === "all" ? undefined : cat,
    state: state === "All states" ? undefined : state,
    maxPrice: maxPrice < MAX_PRICE_CEILING ? maxPrice : undefined,
    page,
    limit: 12,
  });

  const { data: nearbyData, isLoading: isLoadingNearby } = useNearbyEquipment(
    nearMe ? { ...nearMe, radius: 10 } : undefined,
  );

  const nearbyResults = (nearbyData ?? []).filter(
    (e) => cat === "all" || (typeof e.category_id === "string" ? e.category_id : e.category_id?._id) === cat,
  );

  const results = nearMe ? nearbyResults : (data?.items ?? []);
  const pagination = nearMe ? undefined : data?.pagination;
  const loading = nearMe ? isLoadingNearby : isLoading;

  const toggleNearMe = async () => {
    if (nearMe) {
      setNearMe(null);
      return;
    }
    setDetectingNear(true);
    try {
      const pos = await getCurrentPosition();
      setNearMe({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
      setPage(1);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't detect your location.");
    } finally {
      setDetectingNear(false);
    }
  };

  const clear = () => {
    setQueryInput("");
    setSearch("");
    setCat("all");
    setState("All states");
    setMaxPrice(MAX_PRICE_CEILING);
    setPage(1);
    setNearMe(null);
  };

  return (
    <PublicShell>
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-10">
        <PageHeader
          title="Equipment near you"
          description={
            nearMe
              ? `${nearbyResults.length} machines within 10 km`
              : pagination
                ? `${pagination.total} machines match your filters`
                : "Loading listings…"
          }
        />

        <div className="surface-card p-4">
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 size-4.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search equipment or district"
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                aria-label="Search equipment"
                className="h-12 pl-10.5 text-base"
              />
            </div>
            <Button
              type="button"
              variant={nearMe ? "default" : "outline"}
              className="h-12 shrink-0 px-4"
              onClick={toggleNearMe}
              disabled={detectingNear}
            >
              {detectingNear ? (
                <Loader2 className="size-4 animate-spin" />
              ) : nearMe ? (
                <X className="size-4" />
              ) : (
                <LocateFixed className="size-4" />
              )}
              {detectingNear ? "Detecting…" : nearMe ? "Near me (on)" : "Near me"}
            </Button>
          </div>
          {nearMe ? (
            <p className="mt-2 text-xs text-muted-foreground">
              Showing equipment within 10 km of your current location.
            </p>
          ) : null}
        </div>

        <div className={cn("surface-card grid gap-4 p-4 md:grid-cols-3", nearMe && "opacity-60")}>
          <Select
            value={cat}
            onValueChange={(v) => {
              setCat(v);
              setPage(1);
            }}
          >
            <SelectTrigger aria-label="Category">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories?.map((c) => (
                <SelectItem key={c._id} value={c._id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={state}
            disabled={!!nearMe}
            onValueChange={(v) => {
              setState(v);
              setPage(1);
            }}
          >
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
              max={MAX_PRICE_CEILING}
              step={100}
              disabled={!!nearMe}
              onValueChange={(v) => {
                setMaxPrice(v[0] ?? MAX_PRICE_CEILING);
                setPage(1);
              }}
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
            message={
              nearMe
                ? "No equipment listed within 10 km of your location yet — try turning off Near me."
                : "Try widening the price range or removing the district filter — there may be machines just outside your current selection."
            }
            action={
              <Button variant="outline" onClick={clear}>
                Clear all filters
              </Button>
            }
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((item) => (
              <EquipmentCard key={item._id} item={item} />
            ))}
          </div>
        )}

        {pagination && pagination.total > 0 ? (
          <nav className="flex items-center justify-between border-t border-border pt-5 text-sm">
            <p className="text-muted-foreground">
              Page {pagination.page} of {pagination.totalPages} · {pagination.total} total
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          </nav>
        ) : null}

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
