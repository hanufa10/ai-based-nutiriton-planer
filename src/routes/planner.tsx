import { useState, useEffect, useCallback, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Sparkles,
  Coffee,
  Salad,
  Soup,
  Check,
  AlertCircle,
  X,
  Loader2,
} from "lucide-react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { LogFoodForm } from "@/components/log-food-form";
import { WeekProgressChart, type WeekChartDay } from "@/components/week-progress-chart";
import { Card } from "@/components/ui-bits";
import { ApiError } from "@/lib/api";
import { createMealLog, getMealLogsInRange } from "@/lib/api/mealLogs";
import {
  getMealPlans,
  getNutritionTargets,
  generateMealPlan,
  regenerateMealPlanByDate,
} from "@/lib/api/mealPlans";
import { getProgress, getProgressSummary } from "@/lib/api/progress";
import type { MealLog, MealPlan, MealType, ProgressSummary } from "@/lib/api-types";
import {
  formatDayShort,
  formatWeekRange,
  getWeekDates,
  getWeekStart,
  toDateKey,
} from "@/lib/dates";
import {
  isSlotLogged,
  mealLogsByDate,
  mealLogsToSlotRows,
  type MealLogSlotRow,
} from "@/lib/mealLogDisplay";
import {
  SLOT_TO_MEAL_TYPE,
  plansByDate,
  slotDisplay,
  type SlotLabel,
} from "@/lib/mealPlanDisplay";
import { notifyMealLogUpdated, onMealLogUpdated } from "@/lib/mealLogEvents";

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "Meal Planner — NutriSmart" },
      { name: "description", content: "Plan a balanced week of meals tuned to your macros." },
    ],
  }),
  component: PlannerPage,
});

const slots = [
  { label: "Breakfast" as SlotLabel, icon: Coffee, time: "8:00", tint: "citrus" },
  { label: "Lunch" as SlotLabel, icon: Salad, time: "12:30", tint: "leaf" },
  { label: "Dinner" as SlotLabel, icon: Soup, time: "19:00", tint: "lavender" },
] as const;

const tints: Record<string, string> = {
  citrus: "bg-citrus/20",
  leaf: "bg-leaf/15",
  berry: "bg-berry/15",
  lavender: "bg-lavender/20",
};

function PlannerPage() {
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()));
  const [plans, setPlans] = useState<MealPlan[]>([]);
  const [targets, setTargets] = useState<{ calorieGoal: number; proteinGoal: number } | null>(
    null,
  );
  const [todayLogs, setTodayLogs] = useState<MealLogSlotRow[]>([]);
  const [weekChartDays, setWeekChartDays] = useState<WeekChartDay[]>([]);
  const [weekLogsByDate, setWeekLogsByDate] = useState<Map<string, MealLog[]>>(new Map());
  const [summaryByDate, setSummaryByDate] = useState<Map<string, ProgressSummary>>(new Map());

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [generatingDays, setGeneratingDays] = useState<Record<string, boolean>>({});
  const [stagedPlans, setStagedPlans] = useState<Record<string, MealPlan>>({});

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loggingMeal, setLoggingMeal] = useState<string | null>(null);

  const weekDates = useMemo(() => getWeekDates(weekStart), [weekStart]);
  const planMap = useMemo(() => plansByDate(plans), [plans]);
  const todayKey = toDateKey(new Date());
  const dailyKcalTarget = targets?.calorieGoal ?? 1950;

  const currentDayIndex = weekDates.findIndex((d) => toDateKey(d) === todayKey);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const dates = getWeekDates(weekStart);
      const dateKeys = dates.map(toDateKey);
      const weekFrom = dateKeys[0];
      const weekTo = dateKeys[dateKeys.length - 1];

      const [plansData, targetsData, summaries, weekLogs, weightEntries] = await Promise.all([
        getMealPlans(),
        getNutritionTargets().catch((err) => {
          if (err instanceof ApiError && err.status === 404) return null;
          throw err;
        }),
        Promise.all(
          dateKeys.map((key) =>
            getProgressSummary(key).catch(() => null as ProgressSummary | null),
          ),
        ),
        getMealLogsInRange(weekFrom, weekTo),
        getProgress({ from: weekFrom, to: weekTo }).catch(() => []),
      ]);

      setPlans(plansData);
      const calorieGoal = targetsData ? Math.round(targetsData.calorieGoal) : 1950;
      const proteinGoal = targetsData ? Math.round(targetsData.proteinGoal) : 128;
      if (targetsData) {
        setTargets({ calorieGoal, proteinGoal });
      } else {
        setTargets(null);
      }

      const weightByDate = new Map<string, number | null>();
      for (const entry of weightEntries) {
        const key = entry.date.slice(0, 10);
        if (entry.weight != null) {
          weightByDate.set(key, entry.weight);
        }
      }

      const summariesMap = new Map<string, ProgressSummary>();
      const chartDays: WeekChartDay[] = dates.map((date, i) => {
        const summary = summaries[i];
        const dateKey = dateKeys[i];
        if (summary) summariesMap.set(dateKey, summary);
        return {
          dateKey,
          label: formatDayShort(date).slice(0, 3),
          calories: Math.round(summary?.caloriesConsumed ?? 0),
          protein: Math.round(summary?.proteinConsumed ?? 0),
          weight: weightByDate.get(dateKey) ?? null,
          calorieGoal: Math.round(summary?.calorieGoal ?? calorieGoal),
        };
      });

      const logsMap = mealLogsByDate(weekLogs);
      setWeekChartDays(chartDays);
      setSummaryByDate(summariesMap);
      setWeekLogsByDate(logsMap);
      setTodayLogs(mealLogsToSlotRows(logsMap.get(todayKey) ?? []));
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Failed to load meal plans";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [weekStart, todayKey]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => onMealLogUpdated(() => loadData()), [loadData]);

  const handleRegenerateDay = async (dateKey: string) => {
    setActionError(null);
    setGeneratingDays((prev) => ({ ...prev, [dateKey]: true }));

    try {
      const hasPlan = planMap.has(dateKey);
      const result = hasPlan
        ? await regenerateMealPlanByDate(dateKey)
        : await generateMealPlan(dateKey);

      setStagedPlans((prev) => ({
        ...prev,
        [dateKey]: result.mealPlan,
      }));
      if (result.targets?.calorieGoal) {
        setTargets((prev) => ({
          calorieGoal: Math.round(result.targets!.calorieGoal),
          proteinGoal: prev?.proteinGoal ?? Math.round(result.targets!.proteinGoal ?? 128),
        }));
      }
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Could not generate meal plan";
      setActionError(msg);
    } finally {
      setGeneratingDays((prev) => ({ ...prev, [dateKey]: false }));
    }
  };

  const handleAcceptDayPlan = (dateKey: string) => {
    const staged = stagedPlans[dateKey];
    if (!staged) return;

    setPlans((prev) => {
      const filtered = prev.filter((p) => p.planDate.slice(0, 10) !== dateKey);
      return [staged, ...filtered];
    });

    setStagedPlans((prev) => {
      const next = { ...prev };
      delete next[dateKey];
      return next;
    });
  };

  const handleLogPlannedMeal = async (
    dateKey: string,
    slotLabel: SlotLabel,
    displayItems: ReturnType<typeof slotDisplay>["items"],
  ) => {
    if (!displayItems.length) return;
    if (dateKey !== todayKey) {
      setActionError("You can only log meals for today.");
      return;
    }

    const logKey = `${dateKey}-${slotLabel}`;
    setLoggingMeal(logKey);
    setActionError(null);

    try {
      const mealType = SLOT_TO_MEAL_TYPE[slotLabel];
      await createMealLog({
        logDate: todayKey,
        mealType,
        items: displayItems.map((item) => ({
          foodId: item.foodId,
          quantity: item.quantity ?? 1,
        })),
      });
      notifyMealLogUpdated();
      await loadData();
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Failed to log meal";
      setActionError(msg);
    } finally {
      setLoggingMeal(null);
    }
  };

  const totalLoggedKcal = todayLogs.reduce((acc, item) => acc + item.kcal, 0);
  const budgetPercentage = Math.min(100, Math.round((totalLoggedKcal / dailyKcalTarget) * 100));

  const shiftWeek = (delta: number) => {
    setWeekStart((prev) => {
      const next = new Date(prev);
      next.setDate(prev.getDate() + delta * 7);
      return next;
    });
  };

  const weeklyPlannedKcal = weekDates.reduce((sum, date) => {
    const key = toDateKey(date);
    const plan = stagedPlans[key] ?? planMap.get(key);
    if (!plan?.items) return sum;
    const dayTotal = plan.items.reduce((s, item) => s + (item.calories || 0), 0);
    return sum + dayTotal;
  }, 0);
  const daysWithPlans = weekDates.filter((d) => {
    const key = toDateKey(d);
    return !!(stagedPlans[key] ?? planMap.get(key))?.items?.length;
  }).length;
  const weeklyAverage =
    daysWithPlans > 0 ? Math.round(weeklyPlannedKcal / daysWithPlans) : null;

  const weekLoggedKcal = weekChartDays.reduce((sum, d) => sum + d.calories, 0);
  const daysWithLogs = weekChartDays.filter((d) => d.calories > 0).length;
  const proteinGoal = targets?.proteinGoal ?? 128;

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
          eyebrow={`Week of ${formatWeekRange(weekStart).split("–")[0]?.trim()}`}
          title="Meal planner"
          description="Plans are generated from your profile and Ethiopian food database. Regenerate any day, then accept to lock it in."
          actions={
            <>
              <div className="flex items-center rounded-xl border border-border bg-card p-1">
                <button
                  type="button"
                  onClick={() => shiftWeek(-1)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="px-2 text-sm font-medium">{formatWeekRange(weekStart)}</span>
                <button
                  type="button"
                  onClick={() => shiftWeek(1)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              {currentDayIndex >= 0 && (
                <button
                  type="button"
                  onClick={() => handleRegenerateDay(todayKey)}
                  disabled={generatingDays[todayKey]}
                  className="flex h-10 items-center gap-2 rounded-xl bg-primary px-3.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
                >
                  <Sparkles className="h-4 w-4 text-leaf animate-pulse" />
                  {generatingDays[todayKey] ? "Generating…" : "Regen today's plan"}
                </button>
              )}
            </>
          }
        />

        {error && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
            {error.includes("profile") && (
              <>
                {" "}
                <Link to="/onboarding" className="font-semibold underline">
                  Complete onboarding
                </Link>
              </>
            )}
          </div>
        )}

        {actionError && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-900 dark:text-amber-200">
            {actionError}
          </div>
        )}

        <WeekProgressChart
          days={weekChartDays}
          proteinGoal={proteinGoal}
          title={`Progress · ${formatWeekRange(weekStart)}`}
          description="Lines: daily kcal & protein · dashed: goal · berry: weight (/progress)"
          emptyMessage="No logs or weight entries this week. Log meals or add progress to see the chart."
        />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            <div className="overflow-x-auto pb-2 -mx-6 px-6 xl:mx-0 xl:px-0">
              <div className="min-w-[850px]">
                <Card className="overflow-hidden p-0">
                  <div className="grid grid-cols-[120px_repeat(7,minmax(0,1fr))] border-b border-border bg-muted/30">
                <div className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Slot
                </div>
                {weekDates.map((date, i) => {
                  const dateKey = toDateKey(date);
                  const dayLabel = formatDayShort(date);
                  const hasStaged = !!stagedPlans[dateKey];
                  const isLoadingDay = !!generatingDays[dateKey];
                  const isToday = dateKey === todayKey;
                  const daySummary = summaryByDate.get(dateKey);
                  const loggedKcal = Math.round(daySummary?.caloriesConsumed ?? 0);

                  return (
                    <div
                      key={dateKey}
                      className={`px-1 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider relative transition-colors ${
                        hasStaged
                          ? "bg-amber-500/5 text-amber-600"
                          : isToday
                            ? "text-leaf"
                            : "text-muted-foreground"
                      }`}
                    >
                      <div className="flex flex-col items-center justify-between min-h-[54px]">
                        <div>
                          {dayLabel}
                          <div className="mt-0.5 font-display text-base font-semibold text-foreground">
                            {date.getDate()}
                          </div>
                          {loggedKcal > 0 && (
                            <div className="mt-0.5 text-[9px] font-bold normal-case text-leaf">
                              {loggedKcal} kcal
                            </div>
                          )}
                        </div>

                        {hasStaged ? (
                          <button
                            type="button"
                            onClick={() => handleAcceptDayPlan(dateKey)}
                            className="mt-1 px-2 py-0.5 rounded bg-amber-500 text-[9px] font-bold uppercase tracking-tight text-white hover:bg-amber-600 transition-colors"
                          >
                            Accept
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleRegenerateDay(dateKey)}
                            disabled={isLoadingDay}
                            className="mt-1 text-[9px] text-muted-foreground normal-case hover:text-primary transition-colors disabled:opacity-40"
                          >
                            {isLoadingDay ? "…" : "Regen"}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {slots.map((slot) => {
                const Icon = slot.icon;
                return (
                  <div
                    key={slot.label}
                    className="grid grid-cols-[120px_repeat(7,minmax(0,1fr))] border-b border-border last:border-0"
                  >
                    <div className="flex flex-col gap-1 border-r border-border bg-muted/20 px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-lg ${tints[slot.tint]} text-primary`}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                      </div>
                      <div className="font-display text-sm font-semibold">{slot.label}</div>
                      <div className="text-[11px] text-muted-foreground">{slot.time}</div>
                    </div>

                    {weekDates.map((date) => {
                      const dateKey = toDateKey(date);
                      const isStaged = !!stagedPlans[dateKey];
                      const plan = isStaged ? stagedPlans[dateKey] : planMap.get(dateKey);
                      const display = slotDisplay(plan, slot.label);
                      const dayLogs = weekLogsByDate.get(dateKey) ?? [];
                      const slotLogged = isSlotLogged(dayLogs, slot.label);
                      const logKey = `${dateKey}-${slot.label}`;
                      const isLogging = loggingMeal === logKey;

                      return (
                        <div
                          key={dateKey + slot.label}
                          className={`group min-h-[88px] border-r border-border p-2 last:border-0 transition-colors ${
                            isStaged ? "bg-amber-500/5" : ""
                          }`}
                        >
                          <div
                            className={`flex h-full flex-col justify-between rounded-xl ${tints[slot.tint]} p-2.5 transition-all hover:shadow-[var(--shadow-soft)] ${
                              isStaged ? "border border-dashed border-amber-400" : ""
                            }`}
                          >
                            <div
                              className="line-clamp-2 text-xs font-medium leading-snug text-foreground"
                              title={display.detail || undefined}
                            >
                              {display.title}
                            </div>
                            <div className="mt-2 flex items-center justify-between text-[10px] font-semibold text-foreground/60">
                              <span className={isStaged ? "text-amber-700 font-bold" : ""}>
                                {display.kcal > 0 ? `${display.kcal} kcal` : "—"}
                                {isStaged && " ★"}
                                {slotLogged && (
                                  <Check className="ml-0.5 inline h-3 w-3 text-leaf" aria-label="Logged" />
                                )}
                              </span>
                              {display.items.length > 0 && dateKey === todayKey && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleLogPlannedMeal(dateKey, slot.label, display.items)
                                  }
                                  disabled={isLogging}
                                  className="rounded-md p-1 opacity-0 hover:bg-card transition-all group-hover:opacity-100 disabled:opacity-50"
                                  title="Log this meal as eaten today"
                                >
                                  {isLogging ? (
                                    <Loader2 className="h-3 w-3 animate-spin text-primary" />
                                  ) : (
                                    <Plus className="h-3 w-3 text-primary" />
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
                </Card>
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <section className="rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
              <h3 className="font-display text-base font-semibold mb-3">Today&apos;s consumption</h3>
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="font-medium text-muted-foreground">Calories logged</span>
                <span className="font-semibold text-foreground">
                  {totalLoggedKcal} / {dailyKcalTarget} kcal
                </span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${budgetPercentage}%`,
                    backgroundColor:
                      totalLoggedKcal > dailyKcalTarget
                        ? "oklch(0.63 0.22 28)"
                        : "oklch(0.78 0.16 145)",
                  }}
                />
              </div>
              <p className="mt-2 text-right text-[11px] text-muted-foreground">
                {totalLoggedKcal > dailyKcalTarget
                  ? `${totalLoggedKcal - dailyKcalTarget} kcal over target`
                  : `${dailyKcalTarget - totalLoggedKcal} kcal remaining`}
              </p>
            </section>

            <section className="rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-display text-base font-semibold">Eaten today</h3>
                <span className="inline-flex items-center gap-1 rounded-full bg-leaf/10 px-2 py-0.5 text-[10px] font-bold text-leaf">
                  <Check className="h-3 w-3" /> From API
                </span>
              </div>

              {todayLogs.length > 0 ? (
                <ul className="space-y-4 mb-4 relative before:absolute before:bottom-2 before:left-[11px] before:top-2 before:w-0.5 before:bg-border">
                  {todayLogs.map((item) => (
                    <li key={item.id} className="relative flex items-start gap-4 pl-6">
                      <span className="absolute left-[6px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-leaf bg-card" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                            {item.slot}
                          </span>
                        </div>
                        <div className="truncate text-xs font-semibold text-foreground">{item.title}</div>
                        <div className="text-[10px] text-muted-foreground">{item.kcal} kcal</div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="py-4 text-center text-xs text-muted-foreground mb-4">
                  No meals logged yet. Use + on today&apos;s plan cells.
                </p>
              )}

              {!isFormOpen ? (
                <button
                  type="button"
                  onClick={() => setIsFormOpen(true)}
                  className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-border py-2.5 text-xs font-semibold text-foreground hover:bg-muted/50 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5 text-berry" /> Log an unplanned item
                </button>
              ) : (
                <div className="mt-2 rounded-xl border border-border p-3 space-y-2 bg-muted/20">
                  <div className="flex items-center justify-between border-b border-border pb-1.5">
                    <span className="text-xs font-semibold text-foreground flex items-center gap-1">
                      <AlertCircle className="h-3 w-3 text-berry" /> Off-plan item
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsFormOpen(false)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <LogFoodForm
                    onCancel={() => setIsFormOpen(false)}
                    onSuccess={() => {
                      setIsFormOpen(false);
                      loadData();
                    }}
                  />
                </div>
              )}
            </section>

            <section className="rounded-3xl bg-leaf-soft p-5 shadow-[var(--shadow-soft)]">
              <div className="flex items-center gap-2 text-primary">
                <Sparkles className="h-4 w-4 text-leaf" />
                <h3 className="font-display text-sm font-semibold">Smart planner</h3>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                <b className="text-foreground">Regen</b> calls the API to build a day from your
                targets and food database. <b className="text-amber-600 font-bold">Accept</b> saves
                it to your week view.
              </p>
            </section>
          </aside>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Weekly average (planned)
            </div>
            <div className="mt-2 font-display text-3xl font-semibold">
              {weeklyAverage != null ? `${weeklyAverage.toLocaleString()} kcal` : "—"}
            </div>
            <div className="text-xs text-muted-foreground">
              Target {dailyKcalTarget} · {daysWithPlans}/7 days planned
            </div>
          </Card>
          <Card>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Week logged
            </div>
            <div className="mt-2 font-display text-3xl font-semibold">
              {weekLoggedKcal.toLocaleString()} kcal
            </div>
            <div className="text-xs text-muted-foreground">
              {daysWithLogs}/7 days · today {totalLoggedKcal.toLocaleString()} kcal
            </div>
          </Card>
          <Card>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Calorie target
            </div>
            <div className="mt-2 font-display text-3xl font-semibold">
              {dailyKcalTarget.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">
              {targets ? "From your profile" : "Complete onboarding for personal targets"}
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
