import { useEffect, useMemo, useState } from "react";
import { Loader2, Search } from "lucide-react";
import { ApiError } from "@/lib/api";
import type { FoodItem, MealType } from "@/lib/api-types";
import { getFoodItems } from "@/lib/api/foods";
import { createMealLog } from "@/lib/api/mealLogs";
import { toDateKey } from "@/lib/dates";
import { foodPortionMacros, portionQuantity } from "@/lib/foodDisplay";
import { notifyMealLogUpdated } from "@/lib/mealLogEvents";

function defaultMealType(): MealType {
  const hour = new Date().getHours();
  if (hour < 11) return "breakfast";
  if (hour < 15) return "lunch";
  if (hour < 18) return "snack";
  return "dinner";
}

export interface LogFoodFormProps {
  preselectedFood?: FoodItem | null;
  onSuccess?: () => void;
  onCancel?: () => void;
  submitLabel?: string;
}

export function LogFoodForm({
  preselectedFood = null,
  onSuccess,
  onCancel,
  submitLabel = "Add to today's log",
}: LogFoodFormProps) {
  const [search, setSearch] = useState(preselectedFood?.foodName ?? "");
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [loadingFoods, setLoadingFoods] = useState(false);
  const [selected, setSelected] = useState<FoodItem | null>(preselectedFood);
  const [mealType, setMealType] = useState<MealType>(defaultMealType());
  const [grams, setGrams] = useState("100");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSelected(preselectedFood);
    if (preselectedFood) setSearch(preselectedFood.foodName);
  }, [preselectedFood]);

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      setLoadingFoods(true);
      try {
        const query = search.trim();
        const items = await getFoodItems(query ? { query } : undefined);
        if (!cancelled) setFoods(items);
      } catch {
        if (!cancelled) setFoods([]);
      } finally {
        if (!cancelled) setLoadingFoods(false);
      }
    }, 280);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [search]);

  const preview = useMemo(() => {
    if (!selected || selected.foodId <= 0) return null;
    const g = parseFloat(grams) || 100;
    return foodPortionMacros(selected, g);
  }, [selected, grams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected || selected.foodId <= 0) {
      setError("Pick a food from the database list below.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const g = parseFloat(grams) || 100;
      await createMealLog({
        logDate: toDateKey(new Date()),
        mealType,
        items: [{ foodId: selected.foodId, quantity: portionQuantity(g) }],
      });
      notifyMealLogUpdated();
      onSuccess?.();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to log meal.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {!preselectedFood && (
        <div>
          <label className="block text-[10px] font-medium text-muted-foreground mb-1">
            Search food
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setSelected(null);
              }}
              placeholder="Start typing a food name…"
              className="w-full text-xs pl-8 pr-2.5 py-2 rounded-lg border border-border bg-card focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="mt-1.5 max-h-36 overflow-y-auto rounded-lg border border-border bg-card">
            {loadingFoods ? (
              <div className="flex items-center justify-center gap-2 py-4 text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Searching…
              </div>
            ) : foods.length === 0 ? (
              <p className="py-3 text-center text-[10px] text-muted-foreground">No foods found</p>
            ) : (
              foods.slice(0, 12).map((food) => (
                <button
                  key={food.foodId}
                  type="button"
                  onClick={() => {
                    setSelected(food);
                    setSearch(food.foodName);
                  }}
                  className={`flex w-full items-center justify-between px-2.5 py-2 text-left text-xs hover:bg-muted/60 ${
                    selected?.foodId === food.foodId ? "bg-leaf-soft font-semibold" : ""
                  }`}
                >
                  <span className="truncate pr-2">{food.foodName}</span>
                  <span className="shrink-0 text-muted-foreground">
                    {Math.round(food.foodCalories)} kcal/100g
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {preselectedFood && (
        <p className="text-xs font-semibold text-foreground">{preselectedFood.foodName}</p>
      )}

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-[10px] font-medium text-muted-foreground mb-1">Meal</label>
          <select
            value={mealType}
            onChange={(e) => setMealType(e.target.value as MealType)}
            className="w-full text-xs px-2 py-1.5 rounded-lg border border-border bg-card focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="breakfast">Breakfast</option>
            <option value="lunch">Lunch</option>
            <option value="snack">Snack</option>
            <option value="dinner">Dinner</option>
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-medium text-muted-foreground mb-1">
            Portion (g)
          </label>
          <input
            type="number"
            min="1"
            step="1"
            value={grams}
            onChange={(e) => setGrams(e.target.value)}
            className="w-full text-xs px-2 py-1.5 rounded-lg border border-border bg-card focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {preview && (
        <p className="text-[10px] text-muted-foreground">
          ≈ {preview.calories} kcal · P {preview.protein}g · C {preview.carbs}g · F {preview.fat}g
        </p>
      )}

      {error && <p className="text-[10px] text-destructive">{error}</p>}

      <div className="flex gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 text-xs font-semibold py-1.5 rounded-lg border border-border hover:bg-muted"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={submitting || !selected || selected.foodId <= 0}
          className="flex-1 text-xs font-semibold py-1.5 bg-primary text-primary-foreground rounded-lg hover:opacity-95 disabled:opacity-50"
        >
          {submitting ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
