import { apiFetch } from "@/lib/api-client";
import type { AppNotification } from "@/types/models";

export async function listNotifications() {
  const res = await apiFetch<{ success: true; message: string; data: AppNotification[] }>("/notifications");
  return res.data;
}

export async function markNotificationRead(id: string) {
  const res = await apiFetch<{ success: true; message: string; data: AppNotification }>(
    `/notifications/${id}/read`,
    { method: "PATCH" },
  );
  return res.data;
}

export async function markAllNotificationsRead() {
  return apiFetch<{ success: true; message: string }>("/notifications/read-all", { method: "PATCH" });
}

export async function deleteNotification(id: string) {
  return apiFetch<{ success: true; message: string }>(`/notifications/${id}`, { method: "DELETE" });
}
