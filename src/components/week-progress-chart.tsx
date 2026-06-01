import { useMemo } from "react";
import { Card } from "@/components/ui-bits";

export interface WeekChartDay {
  dateKey: string;
  label: string;
  calories: number;
  protein: number;
  weight?: number | null;
  calorieGoal?: number;
}

export interface WeekProgressChartProps {
  days: WeekChartDay[];
  proteinGoal?: number;
  title?: string;
  description?: string;
  emptyMessage?: string;
}

export function WeekProgressChart({
  days,
  proteinGoal = 128,
  title = "Weekly progress",
  description = "Calories logged per day · dots: protein (g) · line: weight (kg)",
  emptyMessage = "No data for this week yet. Log meals to see your progress.",
}: WeekProgressChartProps) {
  const maxCalories = useMemo(
    () => Math.max(2200, ...days.map((d) => d.calories), ...days.map((d) => d.calorieGoal ?? 0), 1),
    [days],
  );

  const maxWeight = useMemo(() => {
    const weights = days.map((d) => d.weight).filter((w): w is number => w != null && w > 0);
    if (!weights.length) return null;
    return Math.max(...weights);
  }, [days]);

  const minWeight = useMemo(() => {
    const weights = days.map((d) => d.weight).filter((w): w is number => w != null && w > 0);
    if (!weights.length) return null;
    return Math.min(...weights);
  }, [days]);

  const hasCalories = days.some((d) => d.calories > 0);
  const hasWeight = days.some((d) => d.weight != null && d.weight > 0);

  return (
    <Card>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="font-display text-xl font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-leaf" /> Calories
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-citrus" /> Protein
          </span>
          {hasWeight && (
            <span className="flex items-center gap-1.5">
              <span className="h-0.5 w-4 rounded bg-berry" /> Weight
            </span>
          )}
        </div>
      </div>

      {!hasCalories && !hasWeight ? (
        <p className="mt-12 py-16 text-center text-sm text-muted-foreground">{emptyMessage}</p>
      ) : (
        <div className="mt-8 flex h-56 items-end gap-2 sm:gap-3">
          {days.map((day) => {
            const calH = (day.calories / maxCalories) * 100;
            const proteinH = (day.protein / Math.max(proteinGoal, 140)) * 100;
            const goalH =
              day.calorieGoal && day.calorieGoal > 0
                ? (day.calorieGoal / maxCalories) * 100
                : null;

            let weightBottom: number | null = null;
            if (
              day.weight != null &&
              day.weight > 0 &&
              maxWeight != null &&
              minWeight != null &&
              maxWeight > minWeight
            ) {
              weightBottom = ((day.weight - minWeight) / (maxWeight - minWeight)) * 85 + 8;
            } else if (day.weight != null && day.weight > 0 && maxWeight === minWeight) {
              weightBottom = 50;
            }

            return (
              <div
                key={day.dateKey}
                className="group relative flex flex-1 flex-col items-center"
                title={
                  [
                    `${day.label}: ${day.calories} kcal`,
                    day.protein > 0 ? `${day.protein}g protein` : null,
                    day.weight != null ? `${day.weight} kg` : null,
                  ]
                    .filter(Boolean)
                    .join(" · ")
                }
              >
                <div className="relative flex h-full w-full items-end">
                  {goalH != null && (
                    <div
                      className="pointer-events-none absolute bottom-0 left-0 right-0 border-t border-dashed border-muted-foreground/30"
                      style={{ bottom: `${goalH}%` }}
                    />
                  )}
                  <div
                    className="w-full rounded-t-lg bg-gradient-to-t from-leaf to-leaf/60 transition-all group-hover:from-leaf"
                    style={{ height: `${Math.max(calH, day.calories > 0 ? 4 : 0)}%` }}
                  />
                  {day.protein > 0 && (
                    <div
                      className="absolute left-1/2 h-3 w-3 -translate-x-1/2 rounded-full border-2 border-card bg-citrus shadow"
                      style={{ bottom: `${proteinH}%` }}
                    />
                  )}
                  {weightBottom != null && (
                    <div
                      className="absolute left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border-2 border-card bg-berry shadow"
                      style={{ bottom: `${weightBottom}%` }}
                    />
                  )}
                </div>
                <div className="mt-2 text-center">
                  <div className="text-[11px] font-medium text-muted-foreground">{day.label}</div>
                  {day.calories > 0 && (
                    <div className="text-[9px] font-semibold text-foreground/70">{day.calories}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
