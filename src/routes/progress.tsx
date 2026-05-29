import { useState, useEffect, useMemo, useCallback } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { TrendingUp, TrendingDown, Award, Flame, Loader2 } from "lucide-react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Card, Ring } from "@/components/ui-bits";
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

interface DayChart {
  d: string;
  dateKey: string;
  v: number;
  p: number;
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

      const [targets, summaries] = await Promise.all([
        getNutritionTargets().catch((err) => {
          if (err instanceof ApiError && err.status === 404) return null;
          throw err;
        }),
        Promise.all(
          dateKeys.map((key) =>
            getProgressSummary(key).catch(() => null as ProgressSummary | null),
          ),
        ),
      ]);

      if (targets) setProteinGoal(Math.round(targets.proteinGoal));

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
          d: formatDayShort(date).slice(0, 3),
          dateKey: dateKeys[i],
          v: calories,
          p: protein,
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

  const max = useMemo(() => Math.max(2200, ...weekData.map((w) => w.v), 1), [weekData]);

  const avgCalories = useMemo(() => {
    const withData = weekData.filter((w) => w.v > 0);
    if (!withData.length) return null;
    return Math.round(withData.reduce((s, w) => s + w.v, 0) / withData.length);
  }, [weekData]);

  const avgProtein = useMemo(() => {
    const withData = weekData.filter((w) => w.p > 0);
    if (!withData.length) return null;
    return Math.round(withData.reduce((s, w) => s + w.p, 0) / withData.length);
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
      if (weekData[i].v > 0) streak++;
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
          <Card>
            <div className="flex items-end justify-between">
              <div>
                <h3 className="font-display text-xl font-semibold">Calories vs. protein</h3>
                <p className="text-sm text-muted-foreground">Bars: kcal · Dots: protein (g)</p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm bg-leaf" /> Calories
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-citrus" /> Protein
                </span>
              </div>
            </div>

            {weekData.every((w) => w.v === 0) ? (
              <p className="mt-12 text-center text-sm text-muted-foreground py-16">
                No meal logs this week yet. Log meals from the planner or dashboard.
              </p>
            ) : (
              <div className="mt-8 flex h-64 items-end gap-3">
                {weekData.map((w) => {
                  const h = (w.v / max) * 100;
                  const ph = (w.p / Math.max(proteinGoal, 140)) * 100;
                  return (
                    <div key={w.dateKey} className="group relative flex flex-1 flex-col items-center">
                      <div className="relative flex h-full w-full items-end">
                        <div
                          className="w-full rounded-t-lg bg-gradient-to-t from-leaf to-leaf/60 transition-all group-hover:from-leaf"
                          style={{ height: `${Math.max(h, w.v > 0 ? 4 : 0)}%` }}
                        />
                        {w.p > 0 && (
                          <div
                            className="absolute left-1/2 h-3 w-3 -translate-x-1/2 rounded-full border-2 border-card bg-citrus shadow"
                            style={{ bottom: `${ph}%` }}
                          />
                        )}
                      </div>
                      <div className="mt-2 text-[11px] font-medium text-muted-foreground">{w.d}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

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
                    className={`mx-auto h-8 w-full rounded-md ${w.met ? "bg-leaf" : w.v > 0 ? "bg-citrus/60" : "bg-muted"}`}
                    title={w.v > 0 ? `${w.v} kcal` : "No logs"}
                  />
                  <div className="mt-1 text-[10px] text-muted-foreground">{w.d}</div>
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
                s: `${weekData.filter((w) => w.v > 0).length} of 7`,
                c: "bg-leaf-soft",
              },
              {
                t: "Protein days",
                s: `${weekData.filter((w) => w.p >= proteinGoal * 0.8).length} near goal`,
                c: "bg-lavender/25",
              },
              {
                t: "Peak day",
                s:
                  weekData.length > 0
                    ? `${Math.max(...weekData.map((w) => w.v)).toLocaleString()} kcal`
                    : "—",
                c: "bg-leaf/20",
              },
              {
                t: "Best protein",
                s:
                  weekData.length > 0
                    ? `${Math.max(...weekData.map((w) => w.p))}g`
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
