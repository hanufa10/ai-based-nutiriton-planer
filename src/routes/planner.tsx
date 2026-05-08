import { createFileRoute } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Plus, Sparkles, Coffee, Salad, Soup, Cookie } from "lucide-react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Card } from "@/components/ui-bits";

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "Meal Planner — NutriSmart" },
      { name: "description", content: "Plan a balanced week of meals tuned to your macros." },
    ],
  }),
  component: PlannerPage,
});

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const slots = [
  { label: "Breakfast", icon: Coffee, time: "8:00", tint: "citrus" },
  { label: "Lunch", icon: Salad, time: "12:30", tint: "leaf" },
  { label: "Snack", icon: Cookie, time: "15:30", tint: "berry" },
  { label: "Dinner", icon: Soup, time: "19:00", tint: "lavender" },
] as const;

const meals: Record<string, string[]> = {
  Breakfast: ["Greek yogurt bowl", "Avocado toast", "Oatmeal & berries", "Protein pancakes", "Chia pudding", "Smoothie bowl", "Veggie omelette"],
  Lunch: ["Quinoa harvest salad", "Chicken wrap", "Buddha bowl", "Tuna nicoise", "Lentil soup", "Falafel plate", "Soba noodles"],
  Snack: ["Protein smoothie", "Apple & almonds", "Hummus & carrots", "Trail mix", "Greek yogurt", "Edamame", "Cottage cheese"],
  Dinner: ["Miso glazed salmon", "Chicken stir-fry", "Veggie curry", "Steak & sweet potato", "Shrimp tacos", "Mushroom risotto", "Roast chicken"],
};

const tints: Record<string, string> = {
  citrus: "bg-citrus/20",
  leaf: "bg-leaf/15",
  berry: "bg-berry/15",
  lavender: "bg-lavender/20",
};

function PlannerPage() {
  return (
    <AppShell>
      <div className="space-y-6 p-6">
        <PageHeader
          eyebrow="Week of May 5"
          title="Meal planner"
          description="Drag, swap, or auto-fill an entire week. NutriSmart balances macros across days for you."
          actions={
            <>
              <div className="flex items-center rounded-xl border border-border bg-card p-1">
                <button className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="px-2 text-sm font-medium">May 5 – 11</span>
                <button className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <button className="flex h-10 items-center gap-2 rounded-xl bg-primary px-3.5 text-sm font-medium text-primary-foreground hover:opacity-90">
                <Sparkles className="h-4 w-4 text-leaf" /> Auto-plan week
              </button>
            </>
          }
        />

        <Card className="overflow-hidden p-0">
          <div className="grid grid-cols-[120px_repeat(7,minmax(0,1fr))] border-b border-border bg-muted/30">
            <div className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Slot
            </div>
            {days.map((d, i) => (
              <div
                key={d}
                className={`px-3 py-3 text-center text-[11px] font-semibold uppercase tracking-wider ${
                  i === 4 ? "text-leaf" : "text-muted-foreground"
                }`}
              >
                {d}
                <div className="mt-0.5 font-display text-base font-semibold text-foreground">
                  {5 + i}
                </div>
              </div>
            ))}
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
                {days.map((d, i) => (
                  <div
                    key={d + slot.label}
                    className="group min-h-[88px] border-r border-border p-2 last:border-0"
                  >
                    <div
                      className={`flex h-full flex-col justify-between rounded-xl ${tints[slot.tint]} p-2.5 transition-shadow hover:shadow-[var(--shadow-soft)]`}
                    >
                      <div className="line-clamp-2 text-xs font-medium leading-snug text-foreground">
                        {meals[slot.label][i]}
                      </div>
                      <div className="mt-2 flex items-center justify-between text-[10px] font-semibold text-foreground/60">
                        <span>{280 + i * 40} kcal</span>
                        <Plus className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </Card>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Weekly average
            </div>
            <div className="mt-2 font-display text-3xl font-semibold">1,920 kcal</div>
            <div className="text-xs text-muted-foreground">Target 1,950 · within range</div>
          </Card>
          <Card>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Protein streak
            </div>
            <div className="mt-2 font-display text-3xl font-semibold">5 / 7 days</div>
            <div className="text-xs text-muted-foreground">+2 vs. last week</div>
          </Card>
          <Card>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Grocery list
            </div>
            <div className="mt-2 font-display text-3xl font-semibold">28 items</div>
            <div className="text-xs text-leaf">Generate from this week →</div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
