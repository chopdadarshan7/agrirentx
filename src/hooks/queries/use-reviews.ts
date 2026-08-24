import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { qk } from "@/lib/query-keys";
import { ApiError } from "@/lib/api-client";
import * as reviewsApi from "@/lib/api/reviews";

function errorMessage(err: unknown, fallback: string) {
  return err instanceof ApiError ? err.message : fallback;
}

export function useEquipmentReviews(equipmentId: string | undefined) {
  return useQuery({
    queryKey: qk.equipmentReviews(equipmentId ?? ""),
    queryFn: () => reviewsApi.listEquipmentReviews(equipmentId as string),
    enabled: !!equipmentId,
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reviewsApi.createReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      toast.success("Review submitted.");
    },
    onError: (err) => toast.error(errorMessage(err, "Could not submit the review.")),
  });
}
