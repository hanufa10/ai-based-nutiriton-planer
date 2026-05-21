import { useState } from "react";
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
  ArrowLeft,
  Check,
  AlertCircle,
  X,
} from "lucide-react";
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

const initialMeals: Record<string, string[]> = {
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

// Simulated pool of smart AI meals grouped by slot types
const aiMealPool: Record<string, string[]> = {
  Breakfast: ["AI Keto Berry Bowl", "Protein Oats", "Avocado Omelette", "AI Green Protein Shake", "Chia Pecan Parfait", "Egg White Frittata", "Flaxseed Pancakes"],
  Lunch: ["AI Turkey Macro Wrap", "Quinoa Salad Bowl", "Salmon Power Bowl", "Lean Beef Stir-Fry", "Tuna Avocado Salad", "Lentil Power Soup", "Chickpea Medley"],
  Snack: ["Almonds & Whey", "Cottage Cheese & Berries", "Protein Bar", "Celery & Peanut Butter", "Mixed Walnuts", "Beef Jerky", "Pumpkin Seeds"],
  Dinner: ["Baked Sea Bass", "AI Lemon Herb Chicken", "Grass-fed Steak", "Garlic Tofu Veggie Mix", "Shrimp & Asparagus", "Turkey Meatballs", "Miso Glazed Salmon"],
};

function PlannerPage() {
  // --- STATE MANAGEMENT ---
  const [weeklyMatrix, setWeeklyMatrix] = useState<Record<string, string[]>>(initialMeals);
  
  // Tracks loading states individually per day (e.g., { "Mon": true })
  const [aiGeneratingDays, setAiGeneratingDays] = useState<Record<string, boolean>>({});
  
  // Staging area for unaccepted day plans (e.g., { "Mon": { Breakfast: "...", Lunch: "..." } })
  const [stagedDayPlans, setStagedDayPlans] = useState<Record<string, Record<string, string>>>({});
  
  // Real state tracking actual items consumed by the user
  const [userMealLog, setUserMealLog] = useState([
    { id: "init-1", slot: "Breakfast", title: "Greek yogurt bowl", kcal: 320, isCustom: false }
  ]);

  // UI state for the inline custom entry panel
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [customTitle, setCustomTitle] = useState("");
  const [customKcal, setCustomKcal] = useState("250");
  const [customSlot, setCustomSlot] = useState("Snack");

  const dailyKcalTarget = 1950;

  // Determine current day string dynamically based on EAT timezone logic (Index 4 = Friday in baseline UI layout)
  const currentDayIndex = 4; 
  const currentDayName = days[currentDayIndex];

  // --- HANDLERS ---
  const handleRegenerateDayPlan = (dayName: string, dayIdx: number) => {
    setAiGeneratingDays((prev) => ({ ...prev, [dayName]: true }));

    setTimeout(() => {
      // Pick random items or specific alternatives from the AI pool based on index math
      const newStagedPlan: Record<string, string> = {};
      slots.forEach((slot) => {
        const choices = aiMealPool[slot.label];
        const randomChoice = choices[(dayIdx + Math.floor(Math.random() * choices.length)) % choices.length];
        newStagedPlan[slot.label] = randomChoice;
      });

      setStagedDayPlans((prev) => ({
        ...prev,
        [dayName]: newStagedPlan,
      }));
      setAiGeneratingDays((prev) => ({ ...prev, [dayName]: false }));
    }, 1000);
  };

  const handleAcceptDayPlan = (dayName: string, dayIdx: number) => {
    const stagedPlan = stagedDayPlans[dayName];
    if (!stagedPlan) return;

    setWeeklyMatrix((prevMatrix) => {
      const updatedMatrix = { ...prevMatrix };
      
      // Map the staged single-day items into their correct slot array positions
      Object.keys(stagedPlan).forEach((slotLabel) => {
        if (updatedMatrix[slotLabel]) {
          const updatedSlots = [...updatedMatrix[slotLabel]];
          updatedSlots[dayIdx] = stagedPlan[slotLabel];
          updatedMatrix[slotLabel] = updatedSlots;
        }
      });
      
      return updatedMatrix;
    });

    // Clear staging reference for this day
    setStagedDayPlans((prev) => {
      const updated = { ...prev };
      delete updated[dayName];
      return updated;
    });
  };

  const handleLogPlannedMeal = (slotLabel: string, mealTitle: string, calculatedKcal: number) => {
    setUserMealLog((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        slot: slotLabel,
        title: mealTitle,
        kcal: calculatedKcal,
        isCustom: false
      }
    ]);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim()) return;

    const parsedKcal = parseInt(customKcal, 10);

    setUserMealLog((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        slot: customSlot,
        title: customTitle,
        kcal: isNaN(parsedKcal) ? 0 : parsedKcal,
        isCustom: true
      }
    ]);

    // Reset Form fields
    setCustomTitle("");
    setCustomKcal("250");
    setIsFormOpen(false);
  };

  // Progress calculations
  const totalLoggedKcal = userMealLog.reduce((acc, item) => acc + item.kcal, 0);
  const budgetPercentage = Math.min(100, Math.round((totalLoggedKcal / dailyKcalTarget) * 100));

  return (
    <AppShell>
      <div className="space-y-6 p-6">

        <PageHeader
          eyebrow="Week of May 5"
          title="Meal planner"
          description="Optimize your day layout with smart AI variations, then accept options to integrate them right into your week matrix tracker."
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
              <button 
                onClick={() => handleRegenerateDayPlan(currentDayName, currentDayIndex)}
                disabled={aiGeneratingDays[currentDayName]}
                className="flex h-10 items-center gap-2 rounded-xl bg-primary px-3.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
              >
                <Sparkles className="h-4 w-4 text-leaf animate-pulse" /> 
                {aiGeneratingDays[currentDayName] ? "Generating Today..." : "Regen Today's Plan"}
              </button>
            </>
          }
        />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_320px]">
          
          {/* LEFT: Weekly Blueprint Matrix */}
          <div className="space-y-6">
            <Card className="overflow-hidden p-0">
              <div className="grid grid-cols-[120px_repeat(7,minmax(0,1fr))] border-b border-border bg-muted/30">
                <div className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Slot
                </div>
                {days.map((d, i) => {
                  const hasStagedPlan = !!stagedDayPlans[d];
                  const isLoadingThisDay = !!aiGeneratingDays[d];

                  return (
                    <div
                      key={d}
                      className={`px-1 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider relative transition-colors ${
                        hasStagedPlan ? "bg-amber-500/5 text-amber-600" : i === currentDayIndex ? "text-leaf" : "text-muted-foreground"
                      }`}
                    >
                      <div className="flex flex-col items-center justify-between min-h-[54px]">
                        <div>
                          {d}
                          <div className="mt-0.5 font-display text-base font-semibold text-foreground">
                            {5 + i}
                          </div>
                        </div>

                        {/* Adaptive Action Headers based on AI generation staging state */}
                        {hasStagedPlan ? (
                          <button
                            onClick={() => handleAcceptDayPlan(d, i)}
                            className="mt-1 px-2 py-0.5 rounded bg-amber-500 text-[9px] font-bold uppercase tracking-tight text-white hover:bg-amber-600 transition-colors"
                          >
                            Accept
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRegenerateDayPlan(d, i)}
                            disabled={isLoadingThisDay}
                            className="mt-1 text-[9px] text-muted-foreground normal-case hover:text-primary transition-colors disabled:opacity-40"
                          >
                            {isLoadingThisDay ? "..." : "Regen"}
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
                        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${tints[slot.tint]} text-primary`}>
                          <Icon className="h-4 w-4" />
                        </div>
                      </div>
                      <div className="font-display text-sm font-semibold">{slot.label}</div>
                      <div className="text-[11px] text-muted-foreground">{slot.time}</div>
                    </div>
                    
                    {days.map((d, i) => {
                      const isStaged = !!stagedDayPlans[d];
                      // Use staged configuration options dynamically if active, otherwise fallback to the accepted table
                      const mealTitle = isStaged 
                        ? stagedDayPlans[d][slot.label] 
                        : (weeklyMatrix[slot.label]?.[i] || "No meal planned");
                        
                      const calculatedKcal = 280 + i * 40;
                      
                      return (
                        <div
                          key={d + slot.label}
                          className={`group min-h-[88px] border-r border-border p-2 last:border-0 transition-colors ${
                            isStaged ? "bg-amber-500/5 animate-pulse" : ""
                          }`}
                        >
                          <div className={`flex h-full flex-col justify-between rounded-xl ${tints[slot.tint]} p-2.5 transition-all hover:shadow-[var(--shadow-soft)] ${
                            isStaged ? "border border-dashed border-amber-400" : ""
                          }`}>
                            <div className="line-clamp-2 text-xs font-medium leading-snug text-foreground">
                              {mealTitle}
                            </div>
                            <div className="mt-2 flex items-center justify-between text-[10px] font-semibold text-foreground/60">
                              <span className={isStaged ? "text-amber-700 font-bold" : ""}>
                                {calculatedKcal} kcal {isStaged && "★"}
                              </span>
                              <button 
                                onClick={() => handleLogPlannedMeal(slot.label, mealTitle, calculatedKcal)}
                                className="rounded-md p-1 opacity-0 hover:bg-card transition-all group-hover:opacity-100"
                                title="Log this meal as eaten today"
                              >
                                <Plus className="h-3 w-3 text-primary" />
                              </button>
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

          {/* RIGHT SIDEBAR: Live Track Feed & Native Log Form */}
          <aside className="space-y-6">
            
            {/* Calories Tracker Progress */}
            <section className="rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
              <h3 className="font-display text-base font-semibold mb-3">Today's Consumption</h3>
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="font-medium text-muted-foreground">Calories Logged</span>
                <span className="font-semibold text-foreground">{totalLoggedKcal} / {dailyKcalTarget} kcal</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                <div 
                  className="h-full rounded-full transition-all duration-300"
                  style={{ 
                    width: `${budgetPercentage}%`, 
                    backgroundColor: totalLoggedKcal > dailyKcalTarget ? "oklch(0.63 0.22 28)" : "oklch(0.78 0.16 145)" 
                  }}
                />
              </div>
              <p className="mt-2 text-right text-[11px] text-muted-foreground">
                {totalLoggedKcal > dailyKcalTarget 
                  ? `${totalLoggedKcal - dailyKcalTarget} kcal over target ceiling` 
                  : `${dailyKcalTarget - totalLoggedKcal} kcal remaining today`}
              </p>
            </section>

            {/* Live Eaten Log Container */}
            <section className="rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-display text-base font-semibold">Eaten Today</h3>
                <span className="inline-flex items-center gap-1 rounded-full bg-leaf/10 px-2 py-0.5 text-[10px] font-bold text-leaf">
                  <Check className="h-3 w-3" /> Eaten Log
                </span>
              </div>

              {userMealLog.length > 0 ? (
                <ul className="space-y-4 mb-4 relative before:absolute before:bottom-2 before:left-[11px] before:top-2 before:w-0.5 before:bg-border">
                  {userMealLog.map((item) => (
                    <li key={item.id} className="relative flex items-start gap-4 pl-6">
                      <span className={`absolute left-[6px] top-1.5 h-2.5 w-2.5 rounded-full border-2 bg-card ${item.isCustom ? "border-berry" : "border-leaf"}`} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">{item.slot}</span>
                          {item.isCustom && (
                            <span className="inline-flex items-center gap-0.5 rounded bg-berry/10 px-1 text-[8px] font-bold text-berry">
                              <AlertCircle className="h-2 w-2" /> Off-Plan
                            </span>
                          )}
                        </div>
                        <div className="truncate text-xs font-semibold text-foreground">{item.title}</div>
                        <div className="text-[10px] text-muted-foreground">{item.kcal} kcal</div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="py-4 text-center text-xs text-muted-foreground mb-4">No items tracked to your active log yet.</p>
              )}

              {/* INLINE EXPANDABLE ENTRY FORM */}
              {!isFormOpen ? (
                <button
                  onClick={() => setIsFormOpen(true)}
                  className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-border py-2.5 text-xs font-semibold text-foreground hover:bg-muted/50 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5 text-berry" /> Log an Unplanned Item
                </button>
              ) : (
                <form onSubmit={handleFormSubmit} className="mt-2 rounded-xl border border-border p-3 space-y-3 bg-muted/20">
                  <div className="flex items-center justify-between border-b border-border pb-1.5">
                    <span className="text-xs font-semibold text-foreground flex items-center gap-1">
                      <AlertCircle className="h-3 w-3 text-berry" /> Off-Plan Item
                    </span>
                    <button type="button" onClick={() => setIsFormOpen(false)} className="text-muted-foreground hover:text-foreground">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-medium text-muted-foreground mb-1">What did you eat?</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Chocolate Cookie, Latte"
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-border bg-card focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-medium text-muted-foreground mb-1">Calories (kcal)</label>
                      <input
                        type="number"
                        min="0"
                        value={customKcal}
                        onChange={(e) => setCustomKcal(e.target.value)}
                        className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-border bg-card focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-medium text-muted-foreground mb-1">Meal Slot</label>
                      <select
                        value={customSlot}
                        onChange={(e) => setCustomSlot(e.target.value)}
                        className="w-full text-xs px-2 py-1.5 rounded-lg border border-border bg-card focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        <option value="Breakfast">Breakfast</option>
                        <option value="Lunch">Lunch</option>
                        <option value="Snack">Snack</option>
                        <option value="Dinner">Dinner</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full text-xs font-semibold py-1.5 bg-primary text-primary-foreground rounded-lg hover:opacity-95 transition-opacity"
                  >
                    Add to Log
                  </button>
                </form>
              )}
            </section>

            <section className="rounded-3xl bg-leaf-soft p-5 shadow-[var(--shadow-soft)]">
              <div className="flex items-center gap-2 text-primary">
                <Sparkles className="h-4 w-4 text-leaf" />
                <h3 className="font-display text-sm font-semibold">Smart Planner Assistant</h3>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Click <b className="text-foreground">Regen</b> on any column header to cook up new variant recipes for that calendar slot. Click <b className="text-amber-600 font-bold">Accept</b> once you are happy to lock it in.
              </p>
            </section>

          </aside>
        </div>

        {/* Footer Metrics */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Weekly average
            </div>
            <div className="mt-2 font-display text-3xl font-semibold">1,920 kcal</div>
            <div className="text-xs text-muted-foreground">Target {dailyKcalTarget} · within range</div>
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
            <div className="text-xs text-leaf cursor-pointer hover:underline">Generate from this week →</div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}