import { apiFetch } from "../api";
import type { GenerateMealPlanResponse, MealPlan, NutritionTargets } from "../api-types";

export function getMealPlans() {
  return apiFetch<MealPlan[]>("/meal-plans");
}

export function getNutritionTargets() {
  return apiFetch<NutritionTargets>("/meal-plans/targets");
}

export function generateMealPlan(planDate: string) {
  return apiFetch<GenerateMealPlanResponse>("/meal-plans/generate", {
    method: "POST",
    body: JSON.stringify({ planDate }),
  });
}

export function regenerateMealPlanByDate(planDate: string) {
  return apiFetch<GenerateMealPlanResponse>("/meal-plans/regenerate-day", {
    method: "POST",
    body: JSON.stringify({ planDate }),
  });
}
