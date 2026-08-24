import { apiFetch } from "@/lib/api-client";
import { toQuery } from "@/lib/utils";
import type { Equipment, Pagination } from "@/types/models";

export type EquipmentFilters = {
  search?: string | undefined;
  category?: string | undefined;
  district?: string | undefined;
  state?: string | undefined;
  minPrice?: number | undefined;
  maxPrice?: number | undefined;
  status?: string | undefined;
  rentaler_id?: string | undefined;
  sort?: "latest" | "price_asc" | "price_desc" | "rating" | undefined;
  page?: number | undefined;
  limit?: number | undefined;
};

type ListResponse = {
  success: true;
  total: number;
  currentPage: number;
  totalPages: number;
  count: number;
  data: Equipment[];
};

export async function listEquipment(filters: EquipmentFilters = {}) {
  const res = await apiFetch<ListResponse>(`/equipments${toQuery(filters)}`);
  const pagination: Pagination = {
    page: res.currentPage,
    limit: filters.limit ?? 10,
    total: res.total,
    totalPages: res.totalPages,
  };
  return { items: res.data, pagination };
}

export async function listNearbyEquipment(params: { latitude: number; longitude: number; radius?: number }) {
  const res = await apiFetch<{ success: true; count: number; data: Equipment[] }>(
    `/equipments/nearby${toQuery(params)}`,
  );
  return res.data;
}

export async function getEquipment(id: string) {
  const res = await apiFetch<{ success: true; data: Equipment }>(`/equipments/${id}`);
  return res.data;
}

function buildEquipmentFormData(input: {
  title: string;
  category_id: string;
  description: string;
  price_per_day: number;
  security_deposit: number;
  location: {
    address: string;
    village?: string | undefined;
    taluka?: string | undefined;
    district?: string | undefined;
    state?: string | undefined;
    pincode?: string | undefined;
    latitude: number;
    longitude: number;
  };
  specs: { label: string; value: string }[];
  images: File[];
}) {
  const fd = new FormData();
  fd.set("title", input.title);
  fd.set("category_id", input.category_id);
  fd.set("description", input.description);
  fd.set("price_per_day", String(input.price_per_day));
  fd.set("security_deposit", String(input.security_deposit));

  fd.set("location[address]", input.location.address);
  if (input.location.village) fd.set("location[village]", input.location.village);
  if (input.location.taluka) fd.set("location[taluka]", input.location.taluka);
  if (input.location.district) fd.set("location[district]", input.location.district);
  if (input.location.state) fd.set("location[state]", input.location.state);
  if (input.location.pincode) fd.set("location[pincode]", input.location.pincode);
  fd.set("location[latitude]", String(input.location.latitude));
  fd.set("location[longitude]", String(input.location.longitude));

  for (const spec of input.specs) {
    if (spec.label && spec.value) {
      fd.append(`specifications[${spec.label}]`, spec.value);
    }
  }

  for (const image of input.images) {
    fd.append("images", image);
  }

  return fd;
}

export type EquipmentFormInput = Parameters<typeof buildEquipmentFormData>[0];

export async function createEquipment(input: EquipmentFormInput) {
  const res = await apiFetch<{ success: true; message: string; data: Equipment }>("/equipments", {
    method: "POST",
    body: buildEquipmentFormData(input),
  });
  return res.data;
}

export async function updateEquipment(id: string, input: EquipmentFormInput) {
  const res = await apiFetch<{ success: true; message: string; data: Equipment }>(`/equipments/${id}`, {
    method: "PUT",
    body: buildEquipmentFormData(input),
  });
  return res.data;
}

export async function deleteEquipment(id: string) {
  return apiFetch<{ success: true; message: string }>(`/equipments/${id}`, { method: "DELETE" });
}
