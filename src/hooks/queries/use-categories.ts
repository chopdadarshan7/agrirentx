import { useQuery } from "@tanstack/react-query";
import { qk } from "@/lib/query-keys";
import * as categoriesApi from "@/lib/api/categories";

export function useCategories() {
  return useQuery({ queryKey: qk.categories, queryFn: categoriesApi.listCategories });
}
