export const MEAL_LOG_UPDATED = "nutrismart:meal-log-updated";

export function notifyMealLogUpdated() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(MEAL_LOG_UPDATED));
  }
}

export function onMealLogUpdated(handler: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(MEAL_LOG_UPDATED, handler);
  return () => window.removeEventListener(MEAL_LOG_UPDATED, handler);
}
