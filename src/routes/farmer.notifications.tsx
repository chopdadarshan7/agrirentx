import { createFileRoute } from "@tanstack/react-router";
import { BellOff, CheckCheck } from "lucide-react";
import { EmptyState, PageHeader } from "@/components/Primitives";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from "@/hooks/queries/use-notifications";

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
  const { data: items = [] } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const unread = items.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description={unread > 0 ? `${unread} unread` : "You're all caught up"}
        actions={
          items.length > 0 ? (
            <Button variant="outline" onClick={() => markAllRead.mutate()} disabled={unread === 0}>
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
              key={n._id}
              className={cn(
                "surface-card flex items-start gap-3 p-4",
                !n.isRead && "border-primary/30 bg-accent/40",
              )}
            >
              <span
                className={cn(
                  "mt-1.5 size-2 shrink-0 rounded-full",
                  !n.isRead ? "bg-primary" : "bg-border",
                )}
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{n.title}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">{n.message}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {new Date(n.createdAt).toLocaleString()}
                </p>
              </div>
              {!n.isRead ? (
                <Button variant="ghost" size="sm" onClick={() => markRead.mutate(n._id)}>
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
