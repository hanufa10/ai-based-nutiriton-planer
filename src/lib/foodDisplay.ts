import type { FoodItem } from "./api-types";

/** Macros for a portion; API stores per-100g and quantity = grams / 100. */
export function portionQuantity(grams: number): number {
  return Math.max(0.01, grams / 100);
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
