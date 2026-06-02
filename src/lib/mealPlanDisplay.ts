import type { MealPlan, MealPlanItem, MealType } from "./api-types";
import {
  formatMealPlanItemsMacroDetail,
  formatMealPlanItemsTitle,
} from "./foodDisplay";

export const SLOT_LABELS = ["Breakfast", "Lunch", "Dinner"] as const;
export type SlotLabel = (typeof SLOT_LABELS)[number];

export const SLOT_TO_MEAL_TYPE: Record<SlotLabel, MealType> = {
  Breakfast: "breakfast",
  Lunch: "lunch",
  Dinner: "dinner",
};

/** Maps API meal types to planner slots (snack omitted from UI). */
export const MEAL_TYPE_TO_SLOT: Partial<Record<MealType, SlotLabel>> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
};

export interface SlotDisplay {
  title: string;
  /** Per-item macros for hover tooltips */
  detail: string;
  kcal: number;
  items: MealPlanItem[];
}

export function getItemsForSlot(plan: MealPlan | undefined, slot: SlotLabel): MealPlanItem[] {
  if (!plan?.items?.length) return [];
  const mealType = SLOT_TO_MEAL_TYPE[slot];
  return plan.items.filter((item) => item.mealType === mealType);
}

export function slotDisplayFromItems(items: MealPlanItem[]): SlotDisplay {
  if (!items.length) {
    return { title: "No meal planned", detail: "", kcal: 0, items: [] };
  }
  const title = formatMealPlanItemsTitle(items);
  const detail = formatMealPlanItemsMacroDetail(items);
  const kcal = Math.round(items.reduce((sum, item) => sum + (item.calories || 0), 0));
  return { title, detail, kcal, items };
}

export function slotDisplay(plan: MealPlan | undefined, slot: SlotLabel): SlotDisplay {
  return slotDisplayFromItems(getItemsForSlot(plan, slot));
}

export function plansByDate(plans: MealPlan[]): Map<string, MealPlan> {
  const map = new Map<string, MealPlan>();
  for (const plan of plans) {
    const key = plan.planDate.slice(0, 10);
    if (!map.has(key)) {
      map.set(key, plan);
    }
  }
  return map;
}
