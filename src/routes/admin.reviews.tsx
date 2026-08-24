import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff, Star, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/Primitives";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  useAdminReviews,
  useHideReview,
  useRestoreReview,
  useDeleteAdminReview,
} from "@/hooks/queries/use-admin";

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
  const [page, setPage] = useState(1);
  const { data } = useAdminReviews({ page, limit: 20 });
  const reviews = data?.items ?? [];
  const pagination = data?.pagination;
  const hideReview = useHideReview();
  const restoreReview = useRestoreReview();
  const deleteReview = useDeleteAdminReview();

  return (
    <div className="space-y-6">
      <PageHeader title="Reviews" description="Hidden reviews stay in records but disappear from listings." />
      {reviews.length === 0 ? (
        <p className="text-sm text-muted-foreground">No reviews yet.</p>
      ) : (
        <ul className="space-y-3">
          {reviews.map((r) => {
            const equipmentTitle =
              typeof r.equipment_id === "string" ? "Equipment" : (r.equipment_id as unknown as { title: string }).title;
            const author = typeof r.farmer_id === "string" ? "Farmer" : r.farmer_id.fullName;
            return (
              <li key={r._id} className="surface-card space-y-2 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">{equipmentTitle}</p>
                    <p className="text-xs text-muted-foreground">
                      {author} · {new Date(r.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-sm font-medium">
                      <Star className="size-4 fill-warning text-warning" />
                      {r.rating.toFixed(1)}
                    </span>
                    <StatusBadge status={r.isVisible ? "approved" : "rejected"} label={r.isVisible ? "Visible" : "Hidden"} />
                  </div>
                </div>
                {r.review ? <p className="text-sm text-muted-foreground">{r.review}</p> : null}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => (r.isVisible ? hideReview.mutate(r._id) : restoreReview.mutate(r._id))}
                  >
                    {r.isVisible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    {r.isVisible ? "Hide" : "Restore"}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive"
                    onClick={() => deleteReview.mutate(r._id)}
                  >
                    <Trash2 className="size-4" />
                    Delete
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {pagination && pagination.totalPages > 1 ? (
        <div className="flex items-center justify-between text-sm">
          <p className="text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages} · {pagination.total} total
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
