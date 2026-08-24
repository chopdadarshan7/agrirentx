import { apiFetch } from "@/lib/api-client";
import type { Review } from "@/types/models";

export async function createReview(input: { booking_id: string; rating: number; review: string }) {
  const res = await apiFetch<{ success: true; message: string; data: Review }>("/reviews", {
    method: "POST",
    body: input,
  });
  return res.data;
}

export async function updateReview(id: string, input: { rating?: number; review?: string }) {
  const res = await apiFetch<{ success: true; message: string; data: Review }>(`/reviews/${id}`, {
    method: "PUT",
    body: input,
  });
  return res.data;
}

export async function deleteReview(id: string) {
  return apiFetch<{ success: true; message: string }>(`/reviews/${id}`, { method: "DELETE" });
}

export async function listEquipmentReviews(equipmentId: string) {
  const res = await apiFetch<{ success: true; message: string; data: Review[] }>(
    `/reviews/equipment/${equipmentId}`,
  );
  return res.data;
}
