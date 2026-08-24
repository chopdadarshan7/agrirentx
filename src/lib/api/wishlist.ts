import { apiFetch } from "@/lib/api-client";
import type { Equipment } from "@/types/models";

export type WishlistItem = {
  _id: string;
  farmer_id: string;
  equipment_id: Equipment;
  createdAt: string;
};

export async function listWishlist() {
  const res = await apiFetch<{ success: true; message: string; data: WishlistItem[] }>("/wishlist");
  return res.data;
}

export async function addToWishlist(equipmentId: string) {
  const res = await apiFetch<{ success: true; message: string; data: WishlistItem }>(
    `/wishlist/${equipmentId}`,
    { method: "POST" },
  );
  return res.data;
}

export async function removeFromWishlist(equipmentId: string) {
  return apiFetch<{ success: true; message: string }>(`/wishlist/${equipmentId}`, { method: "DELETE" });
}

export async function checkWishlist(equipmentId: string) {
  const res = await apiFetch<{ success: true; message: string; data: { isWishlisted: boolean } }>(
    `/wishlist/check/${equipmentId}`,
  );
  return res.data.isWishlisted;
}
