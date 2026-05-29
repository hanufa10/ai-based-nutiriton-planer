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
  Cookie,
  Check,
  AlertCircle,
  X,
  Loader2,
} from "lucide-react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { LogFoodForm } from "@/components/log-food-form";
import { Card } from "@/components/ui-bits";
import { ApiError } from "@/lib/api";
import { getMealLogs, createMealLog } from "@/lib/api/mealLogs";
import {
  getMealPlans,
  getNutritionTargets,
  generateMealPlan,
  regenerateMealPlanByDate,
} from "@/lib/api/mealPlans";
import type { MealPlan, MealType } from "@/lib/api-types";
import {
  formatDayShort,
  formatWeekRange,
  getWeekDates,
  getWeekStart,
  toDateKey,
} from "@/lib/dates";
import {
  SLOT_TO_MEAL_TYPE,
  MEAL_TYPE_TO_SLOT,
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
  { label: "Snack" as SlotLabel, icon: Cookie, time: "15:30", tint: "berry" },
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
  const [targets, setTargets] = useState<{ calorieGoal: number } | null>(null);
  const [todayLogs, setTodayLogs] = useState<
    { id: string; slot: string; title: string; kcal: number; isCustom: boolean }[]
  >([]);

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
      const [plansData, targetsData, logsData] = await Promise.all([
        getMealPlans(),
        getNutritionTargets().catch((err) => {
          if (err instanceof ApiError && err.status === 404) return null;
          throw err;
        }),
        getMealLogs(todayKey),
      ]);

      setPlans(plansData);
      if (targetsData) {
        setTargets({ calorieGoal: Math.round(targetsData.calorieGoal) });
      }

      setTodayLogs(
        logsData.flatMap((log) =>
          log.items.length > 0
            ? [
                {
                  id: String(log.mealLogId),
                  slot: MEAL_TYPE_TO_SLOT[log.mealType as MealType] || log.mealType,
                  title: log.items
                    .map((i) => i.food?.foodName || `Food #${i.foodId}`)
                    .join(" · "),
                  kcal: Math.round(log.caloriesConsumed || 0),
                  isCustom: false,
                },
              ]
            : [],
        ),
      );
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
  }, [todayKey]);

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
        setTargets({ calorieGoal: Math.round(result.targets.calorieGoal) });
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
          quantity: item.quantity || 1,
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
                      const display = isStaged
                        ? slotDisplay(plan, slot.label)
                        : slotDisplay(plan, slot.label);
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
                            <div className="line-clamp-2 text-xs font-medium leading-snug text-foreground">
                              {display.title}
                            </div>
                            <div className="mt-2 flex items-center justify-between text-[10px] font-semibold text-foreground/60">
                              <span className={isStaged ? "text-amber-700 font-bold" : ""}>
                                {display.kcal > 0 ? `${display.kcal} kcal` : "—"}
                                {isStaged && " ★"}
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
                      <span
                        className={`absolute left-[6px] top-1.5 h-2.5 w-2.5 rounded-full border-2 bg-card ${item.isCustom ? "border-berry" : "border-leaf"}`}
                      />
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
              Today logged
            </div>
            <div className="mt-2 font-display text-3xl font-semibold">
              {totalLoggedKcal.toLocaleString()} kcal
            </div>
            <div className="text-xs text-muted-foreground">
              {todayLogs.length} meal log{todayLogs.length === 1 ? "" : "s"}
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
