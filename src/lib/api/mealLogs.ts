import { apiFetch } from "../api";
import type { MealLog, MealType } from "../api-types";

export function getMealLogs(date?: string) {
  const query = date ? `?date=${encodeURIComponent(date)}` : "";
  return apiFetch<MealLog[]>(`/meal-logs${query}`);
}

export function getMealLogsInRange(from: string, to: string) {
  const params = new URLSearchParams({ from, to });
  return apiFetch<MealLog[]>(`/meal-logs?${params.toString()}`);
}

export function createMealLog(payload: {
  logDate: string;
  mealType: MealType;
  items: { foodId: number; quantity: number }[];
  notes?: string;
}) {
  return apiFetch<MealLog>("/meal-logs", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
