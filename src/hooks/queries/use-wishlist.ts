import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { qk } from "@/lib/query-keys";
import { ApiError } from "@/lib/api-client";
import * as wishlistApi from "@/lib/api/wishlist";

function errorMessage(err: unknown, fallback: string) {
  return err instanceof ApiError ? err.message : fallback;
}

export function useWishlist() {
  return useQuery({ queryKey: qk.wishlist, queryFn: wishlistApi.listWishlist });
}

export function useWishlistCheck(equipmentId: string | undefined) {
  return useQuery({
    queryKey: qk.wishlistCheck(equipmentId ?? ""),
    queryFn: () => wishlistApi.checkWishlist(equipmentId as string),
    enabled: !!equipmentId,
  });
}

export function useAddToWishlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (equipmentId: string) => wishlistApi.addToWishlist(equipmentId),
    onSuccess: (_data, equipmentId) => {
      queryClient.invalidateQueries({ queryKey: qk.wishlist });
      queryClient.invalidateQueries({ queryKey: qk.wishlistCheck(equipmentId) });
      toast.success("Added to wishlist.");
    },
    onError: (err) => toast.error(errorMessage(err, "Could not update your wishlist.")),
  });
}

export function useRemoveFromWishlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (equipmentId: string) => wishlistApi.removeFromWishlist(equipmentId),
    onSuccess: (_data, equipmentId) => {
      queryClient.invalidateQueries({ queryKey: qk.wishlist });
      queryClient.invalidateQueries({ queryKey: qk.wishlistCheck(equipmentId) });
      toast.success("Removed from wishlist.");
    },
    onError: (err) => toast.error(errorMessage(err, "Could not update your wishlist.")),
  });
}
