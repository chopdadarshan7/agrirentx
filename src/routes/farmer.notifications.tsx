import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { BellOff, CheckCheck } from "lucide-react";
import { EmptyState, PageHeader } from "@/components/Primitives";
import { Button } from "@/components/ui/button";
import { notifications as seed } from "@/lib/data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/farmer/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — AgriRentX" },
      { name: "description", content: "Booking approvals, payment updates and rental reminders." },
      { property: "og:title", content: "Notifications — AgriRentX" },
      { property: "og:description", content: "Stay on top of booking and payment updates." },
    ],
  }),
  component: FarmerNotificationsPage,
});

function FarmerNotificationsPage() {
  const [items, setItems] = useState(seed);
  const unread = items.filter((n) => n.unread).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description={unread > 0 ? `${unread} unread` : "You're all caught up"}
        actions={
          items.length > 0 ? (
            <Button
              variant="outline"
              onClick={() => setItems((n) => n.map((i) => ({ ...i, unread: false })))}
              disabled={unread === 0}
            >
              <CheckCheck className="size-4" />
              Mark all read
            </Button>
          ) : null
        }
      />

      {items.length === 0 ? (
        <EmptyState
          icon={<BellOff className="size-5" />}
          title="No notifications"
          message="Booking approvals, payment confirmations and rental reminders will show up here."
        />
      ) : (
        <ul className="space-y-3">
          {items.map((n) => (
            <li
              key={n.id}
              className={cn(
                "surface-card flex items-start gap-3 p-4",
                n.unread && "border-primary/30 bg-accent/40",
              )}
            >
              <span
                className={cn(
                  "mt-1.5 size-2 shrink-0 rounded-full",
                  n.unread ? "bg-primary" : "bg-border",
                )}
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{n.title}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">{n.body}</p>
                <p className="mt-1 text-xs text-muted-foreground">{n.at}</p>
              </div>
              {n.unread ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setItems((list) => list.map((i) => (i.id === n.id ? { ...i, unread: false } : i)))
                  }
                >
                  Mark read
                </Button>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
