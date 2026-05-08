import { createFileRoute } from "@tanstack/react-router";
import { TrendingUp, TrendingDown, Award, Flame } from "lucide-react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Card, Ring } from "@/components/ui-bits";

export const Route = createFileRoute("/progress")({
  head: () => ({
    meta: [
      { title: "Progress — NutriSmart" },
      { name: "description", content: "Trends, streaks and weekly insights from your nutrition." },
    ],
  }),
  component: ProgressPage,
});

const weeks = [
  { d: "Mon", v: 1820, p: 90 },
  { d: "Tue", v: 1980, p: 110 },
  { d: "Wed", v: 1740, p: 88 },
  { d: "Thu", v: 2050, p: 120 },
  { d: "Fri", v: 1480, p: 74 },
  { d: "Sat", v: 1900, p: 96 },
  { d: "Sun", v: 1860, p: 102 },
];
const max = 2200;

function ProgressPage() {
  return (
    <AppShell>
      <div className="space-y-6 p-6">
        <PageHeader
          eyebrow="Last 7 days"
          title="Your progress"
          description="Where you're trending across calories, protein and consistency."
          actions={
            <div className="flex items-center rounded-xl border border-border bg-card p-1 text-sm font-medium">
              {["Week", "Month", "Year"].map((t, i) => (
                <button
                  key={t}
                  className={`rounded-lg px-3 py-1.5 ${
                    i === 0 ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          }
        />

        <div className="grid gap-4 sm:grid-cols-4">
          <Stat label="Avg calories" value="1,832" delta="-3%" trend="down" hint="vs. last week" />
          <Stat label="Avg protein" value="97g" delta="+12%" trend="up" hint="goal 128g" />
          <Stat label="Adherence" value="86%" delta="+5%" trend="up" hint="targets met" />
          <Stat label="Streak" value="12d" delta="Best" trend="up" hint="personal record" />
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

            <div className="mt-8 flex h-64 items-end gap-3">
              {weeks.map((w) => {
                const h = (w.v / max) * 100;
                const ph = (w.p / 140) * 100;
                return (
                  <div key={w.d} className="group relative flex flex-1 flex-col items-center">
                    <div className="relative flex h-full w-full items-end">
                      <div
                        className="w-full rounded-t-lg bg-gradient-to-t from-leaf to-leaf/60 transition-all group-hover:from-leaf"
                        style={{ height: `${h}%` }}
                      />
                      <div
                        className="absolute left-1/2 h-3 w-3 -translate-x-1/2 rounded-full border-2 border-card bg-citrus shadow"
                        style={{ bottom: `${ph}%` }}
                      />
                    </div>
                    <div className="mt-2 text-[11px] font-medium text-muted-foreground">{w.d}</div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card>
            <h3 className="font-display text-xl font-semibold">Goal completion</h3>
            <p className="text-sm text-muted-foreground">This week</p>
            <div className="mt-6 flex items-center justify-center">
              <div className="relative">
                <Ring size={180} stroke={16} value={86} color="oklch(0.78 0.16 145)" track="oklch(0.92 0.01 130)" />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-display text-4xl font-semibold">86%</span>
                  <span className="text-xs text-muted-foreground">6 of 7 days</span>
                </div>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-7 gap-1.5">
              {weeks.map((w, i) => (
                <div key={w.d} className="text-center">
                  <div
                    className={`mx-auto h-8 w-full rounded-md ${i === 4 ? "bg-muted" : "bg-leaf"}`}
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
              <h3 className="font-display text-lg font-semibold">Badges earned this month</h3>
              <p className="text-sm text-muted-foreground">Keep the streak alive</p>
            </div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-4">
            {[
              { t: "Hydration hero", s: "7-day streak", c: "bg-leaf-soft" },
              { t: "Protein pro", s: "5 days hit goal", c: "bg-lavender/25" },
              { t: "Veggie champ", s: "30+ servings", c: "bg-leaf/20" },
              { t: "Early bird", s: "Logged before 9am", c: "bg-citrus/25" },
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
