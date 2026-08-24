import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { qk } from "@/lib/query-keys";
import { ApiError } from "@/lib/api-client";
import * as availabilityApi from "@/lib/api/availability";

function errorMessage(err: unknown, fallback: string) {
  return err instanceof ApiError ? err.message : fallback;
}

export function useEquipmentAvailability(equipmentId: string | undefined) {
  return useQuery({
    queryKey: qk.availability(equipmentId ?? ""),
    queryFn: () => availabilityApi.listAvailability(equipmentId as string),
    enabled: !!equipmentId,
  });
}

export function useCreateAvailability() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Parameters<typeof availabilityApi.createAvailability>[0]) =>
      availabilityApi.createAvailability(input),
    onSuccess: (_data, input) => {
      queryClient.invalidateQueries({ queryKey: qk.availability(input.equipment_id) });
      toast.success("Dates blocked.");
    },
    onError: (err) => toast.error(errorMessage(err, "Could not block these dates.")),
  });
}

export function useDeleteAvailability() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string; equipmentId: string }) => availabilityApi.deleteAvailability(id),
    onSuccess: (_data, { equipmentId }) => {
      queryClient.invalidateQueries({ queryKey: qk.availability(equipmentId) });
      toast.success("Block removed.");
    },
    onError: (err) => toast.error(errorMessage(err, "Could not remove this block.")),
  });
}
