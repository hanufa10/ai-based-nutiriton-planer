import { createFileRoute } from "@tanstack/react-router";
import { Search, Filter, Plus, Star } from "lucide-react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Card } from "@/components/ui-bits";

export const Route = createFileRoute("/library")({
  head: () => ({
    meta: [
      { title: "Food Library — NutriSmart" },
      { name: "description", content: "Browse 12,000+ verified foods, recipes and brands." },
    ],
  }),
  component: LibraryPage,
});

const categories = [
  { label: "All", count: 12480, active: true },
  { label: "Proteins", count: 1820 },
  { label: "Grains", count: 940 },
  { label: "Vegetables", count: 2110 },
  { label: "Fruits", count: 760 },
  { label: "Dairy", count: 540 },
  { label: "Nuts & seeds", count: 320 },
  { label: "Snacks", count: 1180 },
];

const foods = [
  { name: "Wild salmon fillet", brand: "Fresh market", kcal: 208, p: 22, c: 0, f: 13, tag: "leaf" },
  { name: "Quinoa, cooked", brand: "Whole grain", kcal: 222, p: 8, c: 39, f: 4, tag: "citrus" },
  { name: "Greek yogurt 2%", brand: "Fage", kcal: 130, p: 18, c: 6, f: 4, tag: "lavender" },
  { name: "Avocado", brand: "Hass", kcal: 234, p: 3, c: 12, f: 21, tag: "leaf" },
  { name: "Chicken breast", brand: "Organic", kcal: 165, p: 31, c: 0, f: 4, tag: "berry" },
  { name: "Sweet potato", brand: "Roasted", kcal: 180, p: 4, c: 41, f: 0, tag: "citrus" },
  { name: "Almonds, raw", brand: "Blue Diamond", kcal: 164, p: 6, c: 6, f: 14, tag: "lavender" },
  { name: "Blueberries", brand: "Fresh", kcal: 84, p: 1, c: 21, f: 0, tag: "berry" },
  { name: "Brown rice", brand: "Lundberg", kcal: 216, p: 5, c: 45, f: 2, tag: "citrus" },
];

const tagBg: Record<string, string> = {
  leaf: "bg-leaf/15",
  citrus: "bg-citrus/20",
  lavender: "bg-lavender/20",
  berry: "bg-berry/15",
};

function LibraryPage() {
  return (
    <AppShell>
      <div className="space-y-6 p-6">
        <PageHeader
          eyebrow="12,480 verified entries"
          title="Food library"
          description="Search, scan or add custom foods. Every item is reviewed for accurate macros."
          actions={
            <button className="flex h-10 items-center gap-2 rounded-xl bg-primary px-3.5 text-sm font-medium text-primary-foreground hover:opacity-90">
              <Plus className="h-4 w-4" /> Add food
            </button>
          }
        />

        <Card className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[260px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="Try 'salmon', 'oats', or scan a barcode…"
              className="h-11 w-full rounded-xl border border-border bg-muted/40 pl-9 pr-3 text-sm focus:bg-background focus:outline-none focus:ring-2 focus:ring-ring/40"
            />
          </div>
          <button className="flex h-11 items-center gap-2 rounded-xl border border-border px-3 text-sm font-medium text-muted-foreground hover:bg-muted">
            <Filter className="h-4 w-4" /> Filters
          </button>
        </Card>

        <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
          <Card className="h-fit p-3">
            <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Categories
            </div>
            <ul className="space-y-1">
              {categories.map((c) => (
                <li key={c.label}>
                  <button
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                      c.active
                        ? "bg-leaf-soft font-semibold text-primary"
                        : "text-foreground hover:bg-muted"
                    }`}
                  >
                    <span>{c.label}</span>
                    <span className="text-[11px] text-muted-foreground">{c.count.toLocaleString()}</span>
                  </button>
                </li>
              ))}
            </ul>
          </Card>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {foods.map((f) => (
              <article
                key={f.name}
                className="group rounded-2xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)]"
              >
                <div className="flex items-start justify-between">
                  <div className={`h-12 w-12 rounded-xl ${tagBg[f.tag]}`} />
                  <button className="text-muted-foreground transition-colors hover:text-citrus">
                    <Star className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-3 font-display text-base font-semibold leading-tight">
                  {f.name}
                </div>
                <div className="text-xs text-muted-foreground">{f.brand} · per 100g</div>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="font-display text-2xl font-semibold">{f.kcal}</span>
                  <span className="text-xs text-muted-foreground">kcal</span>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-1.5 text-[11px]">
                  <div className="rounded-md bg-leaf/10 px-2 py-1 text-center font-semibold text-foreground">
                    P {f.p}g
                  </div>
                  <div className="rounded-md bg-citrus/15 px-2 py-1 text-center font-semibold text-foreground">
                    C {f.c}g
                  </div>
                  <div className="rounded-md bg-lavender/15 px-2 py-1 text-center font-semibold text-foreground">
                    F {f.f}g
                  </div>
                </div>
                <button className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary py-2 text-xs font-semibold text-primary-foreground opacity-0 transition-opacity group-hover:opacity-100">
                  <Plus className="h-3.5 w-3.5" /> Add to today
                </button>
              </article>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
