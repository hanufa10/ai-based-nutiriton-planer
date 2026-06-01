import type { FoodItem, MealPlanItem } from "./api-types";

/** Macros for a portion; API stores per-100g and quantity = grams / 100. */
export function portionQuantity(grams: number): number {
  return Math.max(0.01, grams / 100);
}

/** Inverse of portionQuantity: API quantity → grams on the plate. */
export function quantityToGrams(quantity: number): number {
  return Math.round((quantity || 1) * 100);
}

export function formatMealPlanItemLabel(item: MealPlanItem): string {
  const name = item.food?.foodName || `Food #${item.foodId}`;
  return `${name} (${quantityToGrams(item.quantity)}g)`;
}

export function formatMealPlanItemsTitle(items: MealPlanItem[]): string {
  return items.map(formatMealPlanItemLabel).join(" · ");
}

/** One line per item for native tooltips (title attribute). */
export function formatMealPlanItemsMacroDetail(items: MealPlanItem[]): string {
  return items
    .map((item) => {
      const name = item.food?.foodName || `Food #${item.foodId}`;
      const g = quantityToGrams(item.quantity);
      const kcal = Math.round(item.calories || 0);
      const p = Math.round(item.protein || 0);
      const c = Math.round(item.carbs || 0);
      const f = Math.round(item.fat || 0);
      return `${name} (${g}g): ${kcal} kcal · P ${p}g · C ${c}g · F ${f}g`;
    })
    .join("\n");
}

export function foodPortionMacros(food: FoodItem, grams: number) {
  const q = portionQuantity(grams);
  return {
    calories: Math.round((food.foodCalories || 0) * q),
    protein: Math.round((food.foodProtein || 0) * q),
    carbs: Math.round((food.carbs || 0) * q),
    fat: Math.round((food.fat || 0) * q),
  };
}

const TAGS = ["leaf", "citrus", "lavender", "berry"] as const;

export function foodDisplayTag(food: FoodItem): (typeof TAGS)[number] {
  const key = (food.category || food.foodType || food.foodName || "").toLowerCase();
  if (key.includes("fruit") || key.includes("snack")) return "berry";
  if (key.includes("bread") || key.includes("grain")) return "citrus";
  if (key.includes("stew") || key.includes("meat") || key.includes("protein")) return "leaf";
  const idx = Math.abs(food.foodId) % TAGS.length;
  return TAGS[idx];
}

export function uniqueCategories(foods: FoodItem[]): string[] {
  const set = new Set<string>();
  for (const f of foods) {
    if (f.category?.trim()) set.add(f.category.trim());
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}
