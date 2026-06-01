import type { MealLog, MealType } from "./api-types";
import { MEAL_TYPE_TO_SLOT, type SlotLabel } from "./mealPlanDisplay";

export function logDateKey(logDate: string): string {
  return logDate.slice(0, 10);
}

export function mealLogsByDate(logs: MealLog[]): Map<string, MealLog[]> {
  const map = new Map<string, MealLog[]>();
  for (const log of logs) {
    const key = logDateKey(log.logDate);
    const list = map.get(key) ?? [];
    list.push(log);
    map.set(key, list);
  }
  return map;
}

export interface MealLogSlotRow {
  id: string;
  slot: string;
  title: string;
  kcal: number;
}

export function mealLogsToSlotRows(logs: MealLog[]): MealLogSlotRow[] {
  return logs.flatMap((log) =>
    log.items.length > 0
      ? [
          {
            id: String(log.mealLogId),
            slot: MEAL_TYPE_TO_SLOT[log.mealType as MealType] || log.mealType,
            title: log.items.map((i) => i.food?.foodName || `Food #${i.foodId}`).join(" · "),
            kcal: Math.round(log.caloriesConsumed || 0),
          },
        ]
      : [],
  );
}

export function isSlotLogged(logs: MealLog[], slot: SlotLabel): boolean {
  return logs.some((log) => MEAL_TYPE_TO_SLOT[log.mealType as MealType] === slot);
}
