import { apiFetch } from "@/lib/api-client";
import type { Category } from "@/types/models";

export async function listCategories() {
  const res = await apiFetch<{ success: true; count: number; data: Category[] }>("/categories");
  return res.data;
}

export async function getCategory(id: string) {
  const res = await apiFetch<{ success: true; data: Category }>(`/categories/${id}`);
  return res.data;
}
