import { apiFetch } from "@/lib/api-client";

export type AvailabilityStatus = "available" | "booked" | "blocked" | "maintenance";

export type AvailabilityBlock = {
  _id: string;
  equipment_id: string;
  owner_id: string;
  start_date: string;
  end_date: string;
  status: AvailabilityStatus;
  reason: string;
  createdAt: string;
  updatedAt: string;
};

export async function listAvailability(equipmentId: string) {
  const res = await apiFetch<{ success: true; message: string; data: AvailabilityBlock[] }>(
    `/availability/${equipmentId}`,
  );
  return res.data;
}

export async function createAvailability(input: {
  equipment_id: string;
  start_date: string;
  end_date: string;
  status?: AvailabilityStatus;
  reason?: string;
}) {
  const res = await apiFetch<{ success: true; message: string; data: AvailabilityBlock }>("/availability", {
    method: "POST",
    body: input,
  });
  return res.data;
}

export async function deleteAvailability(availabilityId: string) {
  return apiFetch<{ success: true; message: string }>(`/availability/${availabilityId}`, { method: "DELETE" });
}
