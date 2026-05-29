import { apiFetch } from "../api";
import type { FoodItem } from "../api-types";

export function getFoodItems(params?: { query?: string; foodType?: string }) {
  const search = new URLSearchParams();
  if (params?.query) search.set("query", params.query);
  if (params?.foodType) search.set("foodType", params.foodType);
  const q = search.toString();
  return apiFetch<FoodItem[]>(`/foods${q ? `?${q}` : ""}`);
}
