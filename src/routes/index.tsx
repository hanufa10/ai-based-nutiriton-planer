import { createFileRoute } from "@tanstack/react-router";
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
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Ring } from "@/components/ui-bits";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — NutriSmart" },
      { name: "description", content: "Your daily nutrition snapshot, meals, macros and hydration." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <AppShell>
      <div className="grid grid-cols-1 gap-6 p-6 xl:grid-cols-[minmax(0,1fr)_320px]">
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
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium ring-1 ring-white/15 backdrop-blur">
                      <span className="h-1.5 w-1.5 rounded-full bg-leaf" />
                      Friday · May 8
                    </div>
                    <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.05] sm:text-5xl">
                      Good morning, Maya.
                    </h1>
                    <p className="mt-2 max-w-md text-sm text-primary-foreground/70">
                      You're on a 12-day streak. Two balanced meals away from closing every ring
                      today.
                    </p>

                    <div className="mt-6 flex flex-wrap items-center gap-3">
                      <button className="flex items-center gap-2 rounded-xl bg-leaf px-4 py-2.5 text-sm font-semibold text-primary shadow-[0_8px_24px_-8px] shadow-leaf/60 transition-transform hover:-translate-y-0.5">
                        <Plus className="h-4 w-4" /> Plan today's meals
                      </button>
                      <button className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-medium text-primary-foreground ring-1 ring-white/15 backdrop-blur hover:bg-white/15">
                        View weekly report <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Rings */}
                  <div className="flex items-center gap-6">
                    <RingStat label="Calories" value={72} suffix="1480 / 2050" color="oklch(0.78 0.16 145)" />
                    <RingStat label="Protein" value={58} suffix="74 / 128 g" color="oklch(0.82 0.16 70)" />
                    <RingStat label="Water" value={85} suffix="2.1 / 2.5 L" color="oklch(0.78 0.14 220)" />
                  </div>
                </div>
              </section>

              {/* Quick tiles */}
              <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <QuickTile icon={Flame} label="Calories" value="1,480" delta="+120" tint="leaf-soft" iconBg="leaf" />
                <QuickTile icon={Dumbbell} label="Protein" value="74g" delta="58%" tint="lavender" iconBg="lavender" />
                <QuickTile icon={Droplets} label="Hydration" value="2.1L" delta="85%" tint="citrus" iconBg="citrus" />
                <QuickTile icon={TrendingUp} label="Streak" value="12d" delta="Best" tint="berry" iconBg="berry" />
              </section>

              {/* Today's meals */}
              <section className="rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
                <div className="mb-5 flex items-end justify-between">
                  <div>
                    <h2 className="font-display text-2xl font-semibold">Today's plan</h2>
                    <p className="text-sm text-muted-foreground">
                      Crafted by your AI coach · 1,950 kcal target
                    </p>
                  </div>
                  <button className="text-sm font-medium text-leaf hover:underline">
                    Customize
                  </button>
                </div>

                <ul className="divide-y divide-border">
                  <Meal
                    icon={Coffee}
                    tint="citrus"
                    time="8:30 AM"
                    title="Greek yogurt bowl"
                    sub="Berries · honey · almonds"
                    kcal={320}
                    macros={{ p: 22, c: 38, f: 9 }}
                    state="done"
                  />
                  <Meal
                    icon={Salad}
                    tint="leaf"
                    time="12:45 PM"
                    title="Quinoa harvest salad"
                    sub="Roasted squash · feta · pecans"
                    kcal={520}
                    macros={{ p: 24, c: 58, f: 18 }}
                    state="done"
                  />
                  <Meal
                    icon={Cookie}
                    tint="berry"
                    time="3:30 PM"
                    title="Protein smoothie"
                    sub="Banana · whey · peanut butter"
                    kcal={280}
                    macros={{ p: 28, c: 26, f: 8 }}
                    state="next"
                  />
                  <Meal
                    icon={Soup}
                    tint="lavender"
                    time="7:15 PM"
                    title="Miso glazed salmon"
                    sub="Brown rice · bok choy · sesame"
                    kcal={620}
                    macros={{ p: 42, c: 54, f: 22 }}
                    state="upcoming"
                  />
                </ul>
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
                    <Ring size={160} stroke={14} value={72} color="oklch(0.78 0.16 145)" track="oklch(0.92 0.01 130)" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="font-display text-3xl font-semibold text-foreground">
                        72%
                      </span>
                      <span className="text-xs text-muted-foreground">of daily goal</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  <MacroRow label="Carbs" value={176} goal={240} color="oklch(0.82 0.16 70)" />
                  <MacroRow label="Protein" value={74} goal={128} color="oklch(0.78 0.16 145)" />
                  <MacroRow label="Fat" value={48} goal={70} color="oklch(0.78 0.1 300)" />
                </div>
              </section>

              {/* Hydration */}
              <section className="rounded-3xl bg-leaf-soft p-6 shadow-[var(--shadow-soft)]">
                <div className="flex items-center gap-2 text-primary">
                  <Droplets className="h-5 w-5" />
                  <h3 className="font-display text-lg font-semibold">Hydration</h3>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="font-display text-4xl font-semibold text-primary">2.1</span>
                  <span className="text-sm text-primary/70">/ 2.5 L</span>
                </div>

                <div className="mt-4 grid grid-cols-8 gap-1.5">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-10 rounded-md ${
                        i < 7 ? "bg-primary" : "bg-primary/15"
                      }`}
                    />
                  ))}
                </div>
                <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90">
                  <Plus className="h-4 w-4" /> Add 250 ml
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
                  Your dinner runs heavy on carbs. Swap brown rice for cauliflower rice to free up
                  ~140 kcal for tomorrow's long run.
                </p>
                <button className="mt-4 flex items-center gap-1 text-sm font-semibold text-leaf hover:underline">
                  Apply suggestion <ChevronRight className="h-4 w-4" />
                </button>
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
        <div className="absolute inset-0 flex items-center justify-center font-display text-base font-semibold">
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
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}
