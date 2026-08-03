import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff, Star, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/Primitives";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { reviews as seed } from "@/lib/data";

export const Route = createFileRoute("/admin/reviews")({
  head: () => ({
    meta: [
      { title: "Review Moderation — AgriRentX Admin" },
      { name: "description", content: "Hide, restore or delete reviews that break community guidelines." },
      { property: "og:title", content: "Review Moderation — AgriRentX Admin" },
      { property: "og:description", content: "Keep equipment reviews honest and useful." },
    ],
  }),
  component: AdminReviewsPage,
});

function AdminReviewsPage() {
  const [rows, setRows] = useState(seed);

  return (
    <div className="space-y-6">
      <PageHeader title="Reviews" description="Hidden reviews stay in records but disappear from listings." />
      <ul className="space-y-3">
        {rows.map((r) => (
          <li key={r.id} className="surface-card space-y-2 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-medium">{r.equipmentTitle}</p>
                <p className="text-xs text-muted-foreground">
                  {r.author} · {r.date}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-sm font-medium">
                  <Star className="size-4 fill-warning text-warning" />
                  {r.rating.toFixed(1)}
                </span>
                <StatusBadge status={r.hidden ? "rejected" : "approved"} label={r.hidden ? "Hidden" : "Visible"} />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{r.comment}</p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  setRows((list) => list.map((x) => (x.id === r.id ? { ...x, hidden: !x.hidden } : x)))
                }
              >
                {r.hidden ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                {r.hidden ? "Restore" : "Hide"}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-destructive"
                onClick={() => setRows((list) => list.filter((x) => x.id !== r.id))}
              >
                <Trash2 className="size-4" />
                Delete
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
