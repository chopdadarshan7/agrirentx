import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { qk } from "@/lib/query-keys";
import { ApiError } from "@/lib/api-client";
import * as equipmentApi from "@/lib/api/equipment";
import type { EquipmentFilters, EquipmentFormInput } from "@/lib/api/equipment";

function errorMessage(err: unknown, fallback: string) {
  return err instanceof ApiError ? err.message : fallback;
}

export function useEquipmentList(filters: EquipmentFilters = {}) {
  return useQuery({
    queryKey: qk.equipmentList(filters),
    queryFn: () => equipmentApi.listEquipment(filters),
  });
}

export function useEquipmentDetail(id: string | undefined) {
  return useQuery({
    queryKey: qk.equipmentDetail(id ?? ""),
    queryFn: () => equipmentApi.getEquipment(id as string),
    enabled: !!id,
  });
}

export function useNearbyEquipment(params: { latitude: number; longitude: number; radius?: number } | undefined) {
  return useQuery({
    queryKey: qk.equipmentNearby(params ?? { latitude: 0, longitude: 0 }),
    queryFn: () => equipmentApi.listNearbyEquipment(params!),
    enabled: !!params,
  });
}

/**
 * A rentaler's own listings — includes pending/rejected, unlike the public
 * `GET /equipments/:id`, so the edit page reads from this list rather than
 * the public detail endpoint (which 404s on anything not yet approved).
 */
export function useMyEquipment(rentalerId: string | undefined) {
  return useQuery({
    queryKey: qk.myEquipment(rentalerId ?? ""),
    queryFn: () => equipmentApi.listEquipment(rentalerId ? { rentaler_id: rentalerId, limit: 100 } : { limit: 100 }),
    enabled: !!rentalerId,
  });
}

export function useMyEquipmentDetail(rentalerId: string | undefined, equipmentId: string | undefined) {
  const query = useMyEquipment(rentalerId);
  const item = query.data?.items.find((e) => e._id === equipmentId);
  return { ...query, data: item };
}

export function useCreateEquipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: EquipmentFormInput) => equipmentApi.createEquipment(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["equipment"] });
      toast.success("Listing submitted. Waiting for admin approval.");
    },
    onError: (err) => toast.error(errorMessage(err, "Could not create the listing.")),
  });
}

export function useUpdateEquipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: EquipmentFormInput }) => equipmentApi.updateEquipment(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["equipment"] });
      toast.success("Listing updated. Waiting for admin re-approval.");
    },
    onError: (err) => toast.error(errorMessage(err, "Could not update the listing.")),
  });
}

export function useDeleteEquipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => equipmentApi.deleteEquipment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["equipment"] });
      toast.success("Listing deleted.");
    },
    onError: (err) => toast.error(errorMessage(err, "Could not delete the listing.")),
  });
}
