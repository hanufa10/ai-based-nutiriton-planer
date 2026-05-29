import { useState, useEffect, useCallback, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Plus,
  Flame,
  Droplets,
  Dumbbell,
  Coffee,
  Salad,
  Soup,
  Cookie,
  ChevronRight,
  Sparkles,
  TrendingUp,
  Loader2,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Ring } from "@/components/ui-bits";
import { ApiError } from "@/lib/api";
import { getMealLogs } from "@/lib/api/mealLogs";
import { getMealPlans, getNutritionTargets } from "@/lib/api/mealPlans";
import { getProgressSummary } from "@/lib/api/progress";
import type { MealPlan, MealPlanItem, MealType } from "@/lib/api-types";
import { toDateKey } from "@/lib/dates";
import { MEAL_TYPE_TO_SLOT, getItemsForSlot, type SlotLabel } from "@/lib/mealPlanDisplay";
import { onMealLogUpdated } from "@/lib/mealLogEvents";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — NutriSmart" },
      { name: "description", content: "Your daily nutrition snapshot, meals, macros and hydration." },
    ],
  }),
  component: DashboardPage,
});

interface UserProfile {
  userId: number;
  username: string;
  email: string;
  role: string;
  createdAt: string;
}

const MEAL_ORDER: MealType[] = ["breakfast", "lunch", "snack", "dinner"];

const MEAL_META: Record<
  MealType,
  { icon: typeof Coffee; tint: "leaf" | "citrus" | "berry" | "lavender"; time: string }
> = {
  breakfast: { icon: Coffee, tint: "citrus", time: "8:30 AM" },
  lunch: { icon: Salad, tint: "leaf", time: "12:45 PM" },
  snack: { icon: Cookie, tint: "berry", time: "3:30 PM" },
  dinner: { icon: Soup, tint: "lavender", time: "7:15 PM" },
};

function itemsToMealRow(items: MealPlanItem[]) {
  const title = items.map((i) => i.food?.foodName || `Food #${i.foodId}`).join(" · ");
  const kcal = Math.round(items.reduce((s, i) => s + (i.calories || 0), 0));
  const p = Math.round(items.reduce((s, i) => s + (i.protein || 0), 0));
  const c = Math.round(items.reduce((s, i) => s + (i.carbs || 0), 0));
  const f = Math.round(items.reduce((s, i) => s + (i.fat || 0), 0));
  return { title, sub: `${items.length} item${items.length === 1 ? "" : "s"}`, kcal, macros: { p, c, f } };
}

function DashboardPage() {
  const todayKey = toDateKey(new Date());
  const todayLabel = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  const [user, setUser] = useState<UserProfile | null>(null);
  const [water, setWater] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [calories, setCalories] = useState(0);
  const [protein, setProtein] = useState(0);
  const [carbs, setCarbs] = useState(0);
  const [fat, setFat] = useState(0);
  const [calorieTarget, setCalorieTarget] = useState(2050);
  const [proteinTarget, setProteinTarget] = useState(128);
  const [carbsGoal, setCarbsGoal] = useState(240);
  const [fatGoal, setFatGoal] = useState(70);
  const [todayPlan, setTodayPlan] = useState<MealPlan | null>(null);
  const [loggedMealTypes, setLoggedMealTypes] = useState<Set<MealType>>(new Set());
  const [mealsLoggedToday, setMealsLoggedToday] = useState(0);
  const [adherencePct, setAdherencePct] = useState<number | null>(null);

  const waterTarget = 2.5;

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [targets, plans, logs, summary] = await Promise.all([
        getNutritionTargets().catch((err) => {
          if (err instanceof ApiError && err.status === 404) return null;
          throw err;
        }),
        getMealPlans(),
        getMealLogs(todayKey),
        getProgressSummary(todayKey).catch(() => null),
      ]);

      if (targets) {
        setCalorieTarget(Math.round(targets.calorieGoal));
        setProteinTarget(Math.round(targets.proteinGoal));
        setCarbsGoal(Math.round(targets.carbsGoal));
        setFatGoal(Math.round(targets.fatGoal));
      }

      const plan =
        plans.find((p) => p.planDate.slice(0, 10) === todayKey) ?? null;
      setTodayPlan(plan);

      const consumed = logs.reduce(
        (acc, log) => ({
          calories: acc.calories + (log.caloriesConsumed || 0),
          protein: acc.protein + (log.proteinConsumed || 0),
          carbs: acc.carbs + (log.carbsConsumed || 0),
          fat: acc.fat + (log.fatConsumed || 0),
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 },
      );
      setCalories(Math.round(consumed.calories));
      setProtein(Math.round(consumed.protein));
      setCarbs(Math.round(consumed.carbs));
      setFat(Math.round(consumed.fat));
      setLoggedMealTypes(new Set(logs.map((l) => l.mealType)));
      setMealsLoggedToday(logs.length);

      if (summary?.adherencePct != null) {
        setAdherencePct(Math.round(summary.adherencePct));
      } else if (targets?.calorieGoal) {
        setAdherencePct(
          Math.min(100, Math.round((consumed.calories / targets.calorieGoal) * 100)),
        );
      }
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Failed to load dashboard",
      );
    } finally {
      setLoading(false);
    }
  }, [todayKey]);

  useEffect(() => {
    try {
      const storedProfile = localStorage.getItem("user_profile");
      if (storedProfile) setUser(JSON.parse(storedProfile));
    } catch (e) {
      console.error("Failed to parse user profile:", e);
    }
    loadDashboard();
  }, [loadDashboard]);

  useEffect(() => onMealLogUpdated(() => loadDashboard()), [loadDashboard]);

  const plannedMeals = useMemo(() => {
    if (!todayPlan) return [];
    let foundNext = false;
    return MEAL_ORDER.map((mealType) => {
      const slot = MEAL_TYPE_TO_SLOT[mealType] as SlotLabel;
      const items = getItemsForSlot(todayPlan, slot);
      if (!items.length) return null;
      const row = itemsToMealRow(items);
      const meta = MEAL_META[mealType];
      const isLogged = loggedMealTypes.has(mealType);
      let state: "done" | "next" | "upcoming";
      if (isLogged) state = "done";
      else if (!foundNext) {
        state = "next";
        foundNext = true;
      } else state = "upcoming";
      return { mealType, ...meta, ...row, state };
    }).filter(Boolean) as Array<{
      mealType: MealType;
      icon: typeof Coffee;
      tint: "leaf" | "citrus" | "berry" | "lavender";
      time: string;
      title: string;
      sub: string;
      kcal: number;
      macros: { p: number; c: number; f: number };
      state: "done" | "next" | "upcoming";
    }>;
  }, [todayPlan, loggedMealTypes]);

  const handleAddWater = () => {
    setWater((prev) => Math.min(waterTarget, Number((prev + 0.25).toFixed(2))));
  };

  const streakDisplay = mealsLoggedToday > 0 ? `${mealsLoggedToday} meals` : "—";

  // Percent calculation helpers
  const calPercent = Math.min(100, Math.round((calories / calorieTarget) * 100));
  const proteinPercent = Math.min(100, Math.round((protein / proteinTarget) * 100));
  const waterPercent = Math.min(100, Math.round((water / waterTarget) * 100));

  // Determine how many water grid bars to fill (8 bars total)
  const filledWaterBars = Math.min(8, Math.floor((water / waterTarget) * 8));

  // Get localized greeting name capitalizations or standard fallback text
  const userGreetingName = user?.username
    ? user.username.charAt(0).toUpperCase() + user.username.slice(1)
    : "Champion";

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
      <div className="grid grid-cols-1 gap-6 p-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        {error && (
          <div className="xl:col-span-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
            {error.toLowerCase().includes("profile") && (
              <>
                {" "}
                <Link to="/onboarding" className="font-semibold underline">
                  Complete onboarding
                </Link>
              </>
            )}
          </div>
        )}
        <div className="space-y-6">
          {/* Hero */}
          <section className="relative overflow-hidden rounded-3xl bg-[var(--gradient-hero)] p-6 text-primary-foreground shadow-[var(--shadow-soft)] sm:p-8">
            <div
              aria-hidden
              className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-leaf/20 blur-3xl"
            />
            <div
              aria-hidden
              className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-citrus/10 blur-3xl"
            />
            <div className="relative grid gap-8 sm:grid-cols-[1fr_auto] sm:items-center">
              <div>
                <div
                  className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium ring-1 ring-white/15 backdrop-blur"
                  style={{ color: "oklch(0.27 0.05 145)" }}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-leaf" />
                  {todayLabel}
                </div>

                <h1
                  className="mt-4 font-display text-4xl font-semibold leading-[1.05] sm:text-5xl"
                  style={{ color: "oklch(0.27 0.05 145)" }}
                >
                  Good morning, {userGreetingName}.
                </h1>

                <p
                  className="mt-2 max-w-md text-sm text-primary-foreground/70"
                  style={{ color: "oklch(0.27 0.05 145)" }}
                >
                  {adherencePct != null
                    ? `You're at ${adherencePct}% of today's calorie goal. ${mealsLoggedToday} meal${mealsLoggedToday === 1 ? "" : "s"} logged so far.`
                    : `Log meals from your plan to track calories and macros.`}
                </p>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  {/* Link to Planner Route */}
                  <Link
                    to="/planner"
                    className="flex items-center gap-2 rounded-xl bg-leaf px-4 py-2.5 text-sm font-semibold shadow-[0_8px_24px_-8px] shadow-leaf/60 transition-transform hover:-translate-y-0.5"
                    style={{ color: "oklch(0.27 0.05 145)" }}
                  >
                    <Plus className="h-4 w-4" /> Plan today's meals
                  </Link>

                  {/* Link to Progress Route */}
                  <Link
                    to="/progress"
                    className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-medium ring-1 ring-white/15 backdrop-blur hover:bg-white/15"
                    style={{ color: "oklch(0.27 0.05 145)" }}
                  >
                    View weekly report <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              {/* Rings */}
              <div className="flex flex-wrap justify-center sm:justify-start gap-4 sm:gap-6">
                <RingStat label="Calories" value={calPercent} suffix={`${calories} / ${calorieTarget}`} color="oklch(0.78 0.16 145)" />
                <RingStat label="Protein" value={proteinPercent} suffix={`${protein} / ${proteinTarget} g`} color="oklch(0.82 0.16 70)" />
                <RingStat label="Water" value={waterPercent} suffix={`${water} / ${waterTarget} L`} color="oklch(0.78 0.14 220)" />
              </div>
            </div>
          </section>

          {/* Quick tiles */}
          <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <QuickTile icon={Flame} label="Calories" value={`${calories.toLocaleString()}`} delta="+120" tint="leaf-soft" iconBg="leaf" />
            <QuickTile icon={Dumbbell} label="Protein" value={`${protein}g`} delta={`${proteinPercent}%`} tint="lavender" iconBg="lavender" />
            <QuickTile icon={Droplets} label="Hydration" value={`${water}L`} delta={`${waterPercent}%`} tint="citrus" iconBg="citrus" />
            <QuickTile
              icon={TrendingUp}
              label="Logged today"
              value={streakDisplay}
              delta={adherencePct != null ? `${adherencePct}% goal` : "—"}
              tint="berry"
              iconBg="berry"
            />
          </section>

          {/* Today's meals */}
          <section className="rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
            <div className="mb-5 flex items-end justify-between">
              <div>
                <h2 className="font-display text-2xl font-semibold">Today's plan</h2>
                <p className="text-sm text-muted-foreground">
                  {todayPlan
                    ? `From your meal plan · ${calorieTarget.toLocaleString()} kcal target`
                    : `No plan for today · ${calorieTarget.toLocaleString()} kcal target`}
                </p>
              </div>
              <Link to="/planner" className="text-sm font-medium text-leaf hover:underline">
                {todayPlan ? "Regenerate in planner" : "Generate plan"}
              </Link>
            </div>

            {plannedMeals.length > 0 ? (
              <ul className="divide-y divide-border">
                {plannedMeals.map((meal) => (
                  <Meal
                    key={meal.mealType}
                    icon={meal.icon}
                    tint={meal.tint}
                    time={meal.time}
                    title={meal.title}
                    sub={meal.sub}
                    kcal={meal.kcal}
                    macros={meal.macros}
                    state={meal.state}
                  />
                ))}
              </ul>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No meal plan for today.{" "}
                <Link to="/planner" className="font-semibold text-leaf hover:underline">
                  Open meal planner
                </Link>{" "}
                and tap Regen on today&apos;s column.
              </p>
            )}
          </section>
        </div>

        {/* Right column */}
        <aside className="space-y-6">
          {/* Macro breakdown */}
          <section className="rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold">Macro split</h3>
              <span className="text-xs text-muted-foreground">Today</span>
            </div>

            <div className="mt-5 flex items-center justify-center">
              <div className="relative">
                <Ring size={160} stroke={14} value={calPercent} color="oklch(0.78 0.16 145)" track="oklch(0.92 0.01 130)" />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-display text-3xl font-semibold text-foreground">
                    {calPercent}%
                  </span>
                  <span className="text-xs text-muted-foreground">of daily goal</span>
                </div>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <MacroRow label="Carbs" value={carbs} goal={carbsGoal} color="oklch(0.82 0.16 70)" />
              <MacroRow label="Protein" value={protein} goal={proteinTarget} color="oklch(0.78 0.16 145)" />
              <MacroRow label="Fat" value={fat} goal={fatGoal} color="oklch(0.78 0.1 300)" />
            </div>
          </section>

          {/* Hydration */}
          <section className="rounded-3xl bg-leaf-soft p-6 shadow-[var(--shadow-soft)]">
            <div className="flex items-center gap-2 text-primary">
              <Droplets className="h-5 w-5" />
              <h3 className="font-display text-lg font-semibold">Hydration</h3>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-display text-4xl font-semibold text-primary">{water}</span>
              <span className="text-sm text-primary/70">/ {waterTarget} L</span>
            </div>

            <div className="mt-4 grid grid-cols-8 gap-1.5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-10 rounded-md transition-colors duration-200 ${
                    i < filledWaterBars ? "bg-primary" : "bg-primary/15"
                  }`}
                />
              ))}
            </div>
            <button 
              onClick={handleAddWater}
              disabled={water >= waterTarget}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="h-4 w-4" /> {water >= waterTarget ? "Goal Met!" : "Add 250 ml"}
            </button>
          </section>

          {/* Coach */}
          <section className="rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Sparkles className="h-5 w-5 text-leaf" />
              </div>
              <div>
                <div className="font-display text-base font-semibold">AI coach tip</div>
                <div className="text-xs text-muted-foreground">Personalized for you</div>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {fat > fatGoal * 0.9
                ? "Fat intake is nearing your daily goal. Consider lighter options for your next meal."
                : protein < proteinTarget * 0.5
                  ? "Protein is behind target — prioritize a protein-rich snack or dinner from your plan."
                  : "Ask Sage in the AI coach for meal swaps tailored to your plan and preferences."}
            </p>
            <Link
              to="/coach"
              className="mt-4 flex items-center gap-1 text-sm font-semibold text-leaf hover:underline"
            >
              Open AI coach <ChevronRight className="h-4 w-4" />
            </Link>
          </section>
        </aside>
      </div>
    </AppShell>
  );
}

function RingStat({
  label,
  value,
  suffix,
  color,
}: {
  label: string;
  value: number;
  suffix: string;
  color: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative">
        <Ring size={88} stroke={9} value={value} color={color} />

        <div
          className="absolute inset-0 flex items-center justify-center font-display text-base font-semibold"
          style={{ color: "oklch(0.27 0.05 145)" }}
        >
          {value}%
        </div>
      </div>
      <div className="text-center">
        <div className="text-[11px] uppercase tracking-wider text-primary-foreground/60">
          {label}
        </div>
        <div className="text-xs text-primary-foreground/85">{suffix}</div>
      </div>
    </div>
  );
}

function QuickTile({
  icon: Icon,
  label,
  value,
  delta,
  tint,
  iconBg,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  delta: string;
  tint: "leaf-soft" | "lavender" | "citrus" | "berry";
  iconBg: "leaf" | "lavender" | "citrus" | "berry";
}) {
  const bg = {
    "leaf-soft": "bg-leaf-soft",
    lavender: "bg-lavender/20",
    citrus: "bg-citrus/20",
    berry: "bg-berry/15",
  }[tint];
  const ic = {
    leaf: "bg-leaf text-primary",
    lavender: "bg-lavender text-primary",
    citrus: "bg-citrus text-primary",
    berry: "bg-berry text-primary-foreground",
  }[iconBg];
  return (
    <div className={`group rounded-2xl ${bg} p-4 transition-transform hover:-translate-y-0.5`}>
      <div className="flex items-center justify-between">
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${ic}`}>
          <Icon className="h-4.5 w-4.5" />
        </div>
        <span className="text-[11px] font-semibold text-foreground/60">{delta}</span>
      </div>
      <div className="mt-3 font-display text-2xl font-semibold leading-none">{value}</div>
      <div className="mt-1 text-xs text-foreground/60">{label}</div>
    </div>
  );
}

function Meal({
  icon: Icon,
  tint,
  time,
  title,
  sub,
  kcal,
  macros,
  state,
}: {
  icon: React.ComponentType<{ className?: string }>;
  tint: "leaf" | "citrus" | "berry" | "lavender";
  time: string;
  title: string;
  sub: string;
  kcal: number;
  macros: { p: number; c: number; f: number };
  state: "done" | "next" | "upcoming";
}) {
  const tintBg = {
    leaf: "bg-leaf/20 text-primary",
    citrus: "bg-citrus/25 text-primary",
    berry: "bg-berry/20 text-primary",
    lavender: "bg-lavender/25 text-primary",
  }[tint];
  const stateBadge = {
    done: "bg-leaf/15 text-leaf",
    next: "bg-citrus/25 text-foreground",
    upcoming: "bg-muted text-muted-foreground",
  }[state];
  const stateLabel = { done: "Logged", next: "Up next", upcoming: "Planned" }[state];

  return (
    <li className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${tintBg}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            {time}
          </span>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${stateBadge}`}>
            {stateLabel}
          </span>
        </div>
        <div className="mt-0.5 truncate font-display text-base font-semibold">{title}</div>
        <div className="truncate text-xs text-muted-foreground">{sub}</div>
      </div>
      <div className="hidden text-right sm:block">
        <div className="font-display text-lg font-semibold">{kcal}</div>
        <div className="text-[11px] text-muted-foreground">kcal</div>
      </div>
      <div className="hidden gap-1.5 sm:flex">
        <MacroPill label="P" value={macros.p} color="oklch(0.78 0.16 145)" />
        <MacroPill label="C" value={macros.c} color="oklch(0.82 0.16 70)" />
        <MacroPill label="F" value={macros.f} color="oklch(0.78 0.1 300)" />
      </div>
    </li>
  );
}

function MacroPill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div
      className="flex w-10 flex-col items-center rounded-lg px-1.5 py-1 text-[10px] font-semibold"
      style={{ backgroundColor: `color-mix(in oklab, ${color} 18%, transparent)`, color }}
    >
      <span className="opacity-70">{label}</span>
      <span className="text-foreground">{value}g</span>
    </div>
  );
}

function MacroRow({
  label,
  value,
  goal,
  color,
}: {
  label: string;
  value: number;
  goal: number;
  color: string;
}) {
  const pct = Math.min(100, Math.round((value / goal) * 100));
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="font-medium text-foreground">{label}</span>
        <span className="text-muted-foreground">
          {value} / {goal}g
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full transition-all duration-300" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}