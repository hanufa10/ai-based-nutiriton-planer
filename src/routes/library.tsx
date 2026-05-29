import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search, Filter, Plus, Star, X, Loader2 } from "lucide-react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Card } from "@/components/ui-bits";
import type { FoodItem } from "@/lib/api-types";
import { getFoodItems } from "@/lib/api/foods";
import { foodDisplayTag, uniqueCategories } from "@/lib/foodDisplay";
import { LogFoodForm } from "@/components/log-food-form";

export const Route = createFileRoute("/library")({
  head: () => ({
    meta: [
      { title: "Food Library — NutriSmart" },
      { name: "description", content: "Browse 12,000+ verified foods, recipes and brands." },
    ],
  }),
  component: LibraryPage,
});

const tagBg: Record<string, string> = {
  leaf: "bg-leaf/15",
  citrus: "bg-citrus/20",
  lavender: "bg-lavender/20",
  berry: "bg-berry/15",
};

function LibraryPage() {
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  
  // UI Modal Controls
  const [isNewFoodModalOpen, setIsNewFoodModalOpen] = useState(false);
  const [logFood, setLogFood] = useState<FoodItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State for Adding Custom Food
  const [newName, setNewName] = useState("");
  const [newBrand, setNewBrand] = useState("");
  const [newKcal, setNewKcal] = useState("");
  const [newP, setNewP] = useState("");
  const [newC, setNewC] = useState("");
  const [newF, setNewF] = useState("");
  const [newCategory, setNewCategory] = useState("Proteins");

  // --- HANDLERS ---
  const handleToggleFavorite = (foodName: string) => {
    setFavorites((prev) => ({
      ...prev,
      [foodName]: !prev[foodName],
    }));
  };

  const handleAddToToday = (food: FoodItem) => {
    if (food.foodId <= 0) {
      setToastMessage("Save custom foods to the server first (admin) before logging.");
      setTimeout(() => setToastMessage(null), 4000);
      return;
    }
    setLogFood(food);
  };

  const handleLogSuccess = (foodName: string) => {
    setLogFood(null);
    setToastMessage(`Logged "${foodName}" to today's meals. Check planner or dashboard.`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleCreateFoodSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newBrand.trim()) return;

    const createdItem: FoodItem = {
      foodId: -(Date.now() % 1000000),
      foodName: newName,
      foodCalories: parseInt(newKcal, 10) || 0,
      foodProtein: parseInt(newP, 10) || 0,
      carbs: parseInt(newC, 10) || 0,
      fat: parseInt(newF, 10) || 0,
      category: newCategory,
      foodType: null,
    };

    setFoods((prev) => [createdItem, ...prev]);
    setIsNewFoodModalOpen(false);
    
    // Reset fields
    setNewName("");
    setNewBrand("");
    setNewKcal("");
    setNewP("");
    setNewC("");
    setNewF("");
  };

  useEffect(() => {
    let mounted = true;
    const loadFoods = async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const items = await getFoodItems();
        if (!mounted) return;
        setFoods(items);
      } catch (error) {
        if (!mounted) return;
        setLoadError(error instanceof Error ? error.message : "Failed to load food library.");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadFoods();
    return () => {
      mounted = false;
    };
  }, []);

  const categories = useMemo(() => ["All", ...uniqueCategories(foods)], [foods]);

  const filteredFoods = useMemo(() => {
    return foods.filter((food) => {
      const matchesSearch =
        food.foodName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (food.category || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (food.foodType || "").toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = activeCategory === "All" || food.category === activeCategory;

      return matchesSearch && matchesCategory;
    });
  }, [foods, searchQuery, activeCategory]);

  return (
    <AppShell>
      <div className="space-y-6 p-6 relative">
        
        {/* Toast Notifier Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-primary text-primary-foreground px-4 py-3 rounded-xl shadow-lg border border-border transition-all animate-in fade-in slide-in-from-bottom-4">
            <span className="text-xs font-semibold">{toastMessage}</span>
            <button onClick={() => setToastMessage(null)} className="opacity-70 hover:opacity-100">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <PageHeader
          eyebrow={`${foods.length.toLocaleString()} verified entries`}
          title="Food library"
          description="Search, scan or add custom foods. Every item is reviewed for accurate macros."
          actions={
            <button 
              onClick={() => setIsNewFoodModalOpen(true)}
              className="flex h-10 items-center gap-2 rounded-xl bg-primary px-3.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
            >
              <Plus className="h-4 w-4" /> Add food
            </button>
          }
        />

        <Card className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[260px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Try 'salmon', 'oats', or filter by brand name…"
              className="h-11 w-full rounded-xl border border-border bg-muted/40 pl-9 pr-3 text-sm focus:bg-background focus:outline-none focus:ring-2 focus:ring-ring/40"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")} 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs"
              >
                Clear
              </button>
            )}
          </div>
          <button
            type="button"
            className="flex h-11 items-center gap-2 rounded-xl border border-border px-3 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
          >
            <Filter className="h-4 w-4" /> Filters
          </button>
        </Card>

        <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
          
          {/* LEFT: Categories Drawer Selection */}
          <Card className="h-fit p-3">
            <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Categories
            </div>
            <ul className="space-y-1">
              {categories.map((c) => {
                const isActive = activeCategory === c;
                const count =
                  c === "All"
                    ? foods.length
                    : foods.filter((f) => (f.category || "") === c).length;
                return (
                  <li key={c}>
                    <button
                      type="button"
                      onClick={() => setActiveCategory(c)}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                        isActive
                          ? "bg-leaf-soft font-semibold text-primary"
                          : "text-foreground hover:bg-muted"
                      }`}
                    >
                      <span>{c}</span>
                      <span className="text-[11px] text-muted-foreground">
                        {count.toLocaleString()}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </Card>

          {/* RIGHT: Grid Grid list output filtered array mapping */}
          <div>
            {loading ? (
              <Card className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
                <Loader2 className="h-8 w-8 mb-2 animate-spin opacity-70" />
                <p className="text-sm font-medium">Loading food library...</p>
              </Card>
            ) : loadError ? (
              <Card className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
                <p className="text-sm font-medium text-destructive">{loadError}</p>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="mt-2 text-xs text-primary underline"
                >
                  Reload
                </button>
              </Card>
            ) : filteredFoods.length === 0 ? (
              <Card className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
                <Search className="h-8 w-8 mb-2 opacity-40" />
                <p className="text-sm font-medium">No results found for your filters.</p>
                <button
                  type="button"
                  onClick={() => { setSearchQuery(""); setActiveCategory("All"); }}
                  className="mt-2 text-xs text-primary underline"
                >
                  Reset parameters
                </button>
              </Card>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {filteredFoods.map((f) => {
                  const isFav = !!favorites[f.foodName];
                  const tag = foodDisplayTag(f);
                  return (
                    <article
                      key={f.foodId}
                      className="group rounded-2xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)]"
                    >
                      <div className="flex items-start justify-between">
                        <div className={`h-12 w-12 rounded-xl ${tagBg[tag]}`} />
                        <button
                          type="button"
                          onClick={() => handleToggleFavorite(f.foodName)}
                          className={`transition-colors ${isFav ? "text-amber-500 hover:text-amber-600" : "text-muted-foreground hover:text-citrus"}`}
                        >
                          <Star className="h-4 w-4" fill={isFav ? "currentColor" : "none"} />
                        </button>
                      </div>
                      <div className="mt-3 font-display text-base font-semibold leading-tight">
                        {f.foodName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {(f.category || f.foodType || "General").toString()} · per 100g
                      </div>
                      <div className="mt-3 flex items-baseline gap-1">
                        <span className="font-display text-2xl font-semibold">{Math.round(f.foodCalories || 0)}</span>
                        <span className="text-xs text-muted-foreground">kcal</span>
                      </div>
                      <div className="mt-3 grid grid-cols-3 gap-1.5 text-[11px]">
                        <div className="rounded-md bg-leaf/10 px-2 py-1 text-center font-semibold text-foreground">
                          P {Math.round(f.foodProtein || 0)}g
                        </div>
                        <div className="rounded-md bg-citrus/15 px-2 py-1 text-center font-semibold text-foreground">
                          C {Math.round(f.carbs || 0)}g
                        </div>
                        <div className="rounded-md bg-lavender/15 px-2 py-1 text-center font-semibold text-foreground">
                          F {Math.round(f.fat || 0)}g
                        </div>
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => handleAddToToday(f)}
                        className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary py-2 text-xs font-semibold text-primary-foreground opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
                      >
                        <Plus className="h-3.5 w-3.5" /> Add to today
                      </button>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {logFood && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <Card className="w-full max-w-md p-6 relative bg-card shadow-2xl border border-border">
              <button
                type="button"
                onClick={() => setLogFood(null)}
                className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
              <h3 className="font-display text-lg font-semibold mb-1">Log to today</h3>
              <p className="text-xs text-muted-foreground mb-4">
                This saves to your meal log and updates dashboard &amp; progress.
              </p>
              <LogFoodForm
                preselectedFood={logFood}
                onCancel={() => setLogFood(null)}
                onSuccess={() => handleLogSuccess(logFood.foodName)}
              />
            </Card>
          </div>
        )}

        {/* --- ADD NEW FOOD MODAL OVERLAY --- */}
        {isNewFoodModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
            <Card className="w-full max-w-md p-6 relative bg-card shadow-2xl border border-border animate-in scale-in-95">
              <button 
                onClick={() => setIsNewFoodModalOpen(false)}
                className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
              
              <h3 className="font-display text-lg font-semibold mb-1">Add Custom Food</h3>
              <p className="text-xs text-muted-foreground mb-4">Introduce a verification item into your macro library framework index.</p>
              
              <form onSubmit={handleCreateFoodSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Food Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Lean Ground Beef"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-border bg-muted/20 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Brand / Source Descriptor</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Local Vendor, Homemade"
                    value={newBrand}
                    onChange={(e) => setNewBrand(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-border bg-muted/20 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Calories (per 100g)</label>
                    <input
                      type="number"
                      min="0"
                      required
                      placeholder="kcal"
                      value={newKcal}
                      onChange={(e) => setNewKcal(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-border bg-muted/20 focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Library Segment</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full text-xs px-2.5 py-2 rounded-lg border border-border bg-muted/20 focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      {categories.filter((c) => c !== "All").map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 border-t border-border/60 pt-3">
                  <div>
                    <label className="block text-[10px] font-medium text-muted-foreground mb-1">Protein (g)</label>
                    <input
                      type="number"
                      min="0"
                      value={newP}
                      onChange={(e) => setNewP(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-border bg-muted/20 focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-muted-foreground mb-1">Carbs (g)</label>
                    <input
                      type="number"
                      min="0"
                      value={newC}
                      onChange={(e) => setNewC(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-border bg-muted/20 focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-muted-foreground mb-1">Fat (g)</label>
                    <input
                      type="number"
                      min="0"
                      value={newF}
                      onChange={(e) => setNewF(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-border bg-muted/20 focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 text-xs font-semibold py-2.5 bg-primary text-primary-foreground rounded-xl hover:opacity-95 transition-opacity"
                >
                  Save Entry to Catalog
                </button>
              </form>
            </Card>
          </div>
        )}

      </div>
    </AppShell>
  );
}