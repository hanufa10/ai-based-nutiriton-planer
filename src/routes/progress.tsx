import { useState, useEffect, useMemo, useCallback } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { TrendingUp, TrendingDown, Award, Flame, Loader2 } from "lucide-react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { WeekProgressChart, type WeekChartDay } from "@/components/week-progress-chart";
import { Card, Ring } from "@/components/ui-bits";
import { getProgress } from "@/lib/api/progress";
import { ApiError } from "@/lib/api";
import { getNutritionTargets } from "@/lib/api/mealPlans";
import { getProgressSummary } from "@/lib/api/progress";
import type { ProgressSummary } from "@/lib/api-types";
import { formatDayShort, getWeekDates, getWeekStart, toDateKey } from "@/lib/dates";
import { onMealLogUpdated } from "@/lib/mealLogEvents";

export const Route = createFileRoute("/progress")({
  head: () => ({
    meta: [
      { title: "Progress — NutriSmart" },
      { name: "description", content: "Trends, streaks and weekly insights from your nutrition." },
    ],
  }),
  component: ProgressPage,
});

interface DayChart extends WeekChartDay {
  met: boolean;
}

function ProgressPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [weekData, setWeekData] = useState<DayChart[]>([]);
  const [proteinGoal, setProteinGoal] = useState(128);

  const loadProgress = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const weekStart = getWeekStart(new Date());
      const dates = getWeekDates(weekStart);
      const dateKeys = dates.map(toDateKey);

      const weekFrom = dateKeys[0];
      const weekTo = dateKeys[dateKeys.length - 1];

      const [targets, summaries, weightEntries] = await Promise.all([
        getNutritionTargets().catch((err) => {
          if (err instanceof ApiError && err.status === 404) return null;
          throw err;
        }),
        Promise.all(
          dateKeys.map((key) =>
            getProgressSummary(key).catch(() => null as ProgressSummary | null),
          ),
        ),
        getProgress({ from: weekFrom, to: weekTo }).catch(() => []),
      ]);

      if (targets) setProteinGoal(Math.round(targets.proteinGoal));

      const weightByDate = new Map<string, number | null>();
      for (const entry of weightEntries) {
        const key = entry.date.slice(0, 10);
        if (entry.weight != null) weightByDate.set(key, entry.weight);
      }

      const chart: DayChart[] = dates.map((date, i) => {
        const summary = summaries[i];
        const calories = Math.round(summary?.caloriesConsumed ?? 0);
        const protein = Math.round(summary?.proteinConsumed ?? 0);
        const goal = summary?.calorieGoal ?? targets?.calorieGoal ?? 0;
        const met =
          summary != null &&
          (summary.totalMeals > 0 ||
            (summary.adherencePct != null && summary.adherencePct >= 70));
        return {
          label: formatDayShort(date).slice(0, 3),
          dateKey: dateKeys[i],
          calories,
          protein,
          weight: weightByDate.get(dateKeys[i]) ?? null,
          calorieGoal: goal > 0 ? Math.round(goal) : undefined,
          met: goal > 0 ? calories > 0 && calories <= goal * 1.1 : met,
        };
      });

      setWeekData(chart);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Failed to load progress",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  useEffect(() => onMealLogUpdated(() => loadProgress()), [loadProgress]);

  const avgCalories = useMemo(() => {
    const withData = weekData.filter((w) => w.calories > 0);
    if (!withData.length) return null;
    return Math.round(withData.reduce((s, w) => s + w.calories, 0) / withData.length);
  }, [weekData]);

  const avgProtein = useMemo(() => {
    const withData = weekData.filter((w) => w.protein > 0);
    if (!withData.length) return null;
    return Math.round(withData.reduce((s, w) => s + w.protein, 0) / withData.length);
  }, [weekData]);

  const completionMetrics = useMemo(() => {
    const completed = weekData.filter((w) => w.met).length;
    const percentage =
      weekData.length > 0 ? Math.round((completed / weekData.length) * 100) : 0;
    return { completed, percentage };
  }, [weekData]);

  const loggingStreak = useMemo(() => {
    let streak = 0;
    for (let i = weekData.length - 1; i >= 0; i--) {
      if (weekData[i].calories > 0) streak++;
      else break;
    }
    return streak;
  }, [weekData]);

  if (loading) {
    return (
      <AppShell>
        <div className="flex min-h-[50vh] items-center justify-center p-6">
          <Loader2 className="h-8 w-8 animate-spin text-leaf" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6 p-6">
        <PageHeader
          eyebrow="Last 7 days"
          title="Your progress"
          description="Calories and protein from meal logs, compared to your daily targets."
        />

        {error && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-4">
          <Stat
            label="Avg calories"
            value={avgCalories != null ? avgCalories.toLocaleString() : "—"}
            delta={avgCalories != null ? "logged" : "—"}
            trend="up"
            hint="days with meal logs"
          />
          <Stat
            label="Avg protein"
            value={avgProtein != null ? `${avgProtein}g` : "—"}
            delta={avgProtein != null ? "logged" : "—"}
            trend="up"
            hint={`goal ${proteinGoal}g`}
          />
          <Stat
            label="Adherence"
            value={`${completionMetrics.percentage}%`}
            delta={`${completionMetrics.completed}/7`}
            trend="up"
            hint="days on target"
          />
          <Stat
            label="Logging streak"
            value={loggingStreak > 0 ? `${loggingStreak}d` : "—"}
            delta="This week"
            trend="up"
            hint="consecutive days"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <WeekProgressChart
            days={weekData}
            proteinGoal={proteinGoal}
            title="Calories vs. protein"
            description="Bars: kcal from meal logs · dots: protein · markers: weight from /progress"
          />

          <Card>
            <h3 className="font-display text-xl font-semibold">Goal completion</h3>
            <p className="text-sm text-muted-foreground">This week (from logs)</p>
            <div className="mt-6 flex items-center justify-center">
              <div className="relative">
                <Ring
                  size={180}
                  stroke={16}
                  value={completionMetrics.percentage}
                  color="oklch(0.78 0.16 145)"
                  track="oklch(0.92 0.01 130)"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-display text-4xl font-semibold">
                    {completionMetrics.percentage}%
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {completionMetrics.completed} of 7 days
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-7 gap-1.5">
              {weekData.map((w) => (
                <div key={w.dateKey} className="text-center">
                  <div
                    className={`mx-auto h-8 w-full rounded-md ${w.met ? "bg-leaf" : w.calories > 0 ? "bg-citrus/60" : "bg-muted"}`}
                    title={w.calories > 0 ? `${w.calories} kcal` : "No logs"}
                  />
                  <div className="mt-1 text-[10px] text-muted-foreground">{w.label}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-citrus/25">
              <Award className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold">This week at a glance</h3>
              <p className="text-sm text-muted-foreground">Based on your meal log activity</p>
            </div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-4">
            {[
              {
                t: "Days logged",
                s: `${weekData.filter((w) => w.calories > 0).length} of 7`,
                c: "bg-leaf-soft",
              },
              {
                t: "Protein days",
                s: `${weekData.filter((w) => w.protein >= proteinGoal * 0.8).length} near goal`,
                c: "bg-lavender/25",
              },
              {
                t: "Peak day",
                s:
                  weekData.length > 0
                    ? `${Math.max(...weekData.map((w) => w.calories)).toLocaleString()} kcal`
                    : "—",
                c: "bg-leaf/20",
              },
              {
                t: "Best protein",
                s:
                  weekData.length > 0
                    ? `${Math.max(...weekData.map((w) => w.protein))}g`
                    : "—",
                c: "bg-citrus/25",
              },
            ].map((b) => (
              <div key={b.t} className={`rounded-2xl ${b.c} p-4`}>
                <Flame className="h-5 w-5 text-primary" />
                <div className="mt-3 font-display text-sm font-semibold text-primary">{b.t}</div>
                <div className="text-[11px] text-primary/70">{b.s}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}

function Stat({
  label,
  value,
  delta,
  trend,
  hint,
}: {
  label: string;
  value: string;
  delta: string;
  trend: "up" | "down";
  hint: string;
}) {
  const TrendIcon = trend === "up" ? TrendingUp : TrendingDown;
  const color = trend === "up" ? "text-leaf" : "text-berry";
  return (
    <Card>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <span className={`flex items-center gap-1 text-xs font-semibold ${color}`}>
          <TrendIcon className="h-3.5 w-3.5" /> {delta}
        </span>
      </div>
      <div className="mt-3 font-display text-3xl font-semibold">{value}</div>
      <div className="text-xs text-muted-foreground">{hint}</div>
    </Card>
  );
}
