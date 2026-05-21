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




// import { useState, useMemo } from "react";
// import { createFileRoute } from "@tanstack/react-router";
// import { TrendingUp, TrendingDown, Award, Flame, Info } from "lucide-react";
// import { AppShell, PageHeader } from "@/components/app-shell";
// import { Card, Ring } from "@/components/ui-bits";

// export const Route = createFileRoute("/progress")({
//   head: () => ({
//     meta: [
//       { title: "Progress — NutriSmart" },
//       { name: "description", content: "Trends, streaks and weekly insights from your nutrition." },
//     ],
//   }),
//   component: ProgressPage,
// });

// // --- TIME SEGMENT DATASETS ---
// const weeklyData = [
//   { d: "Mon", v: 1820, p: 90, met: true },
//   { d: "Tue", v: 1980, p: 110, met: true },
//   { d: "Wed", v: 1740, p: 88, met: true },
//   { d: "Thu", v: 2050, p: 120, met: true },
//   { d: "Fri", v: 1480, p: 74, met: false },
//   { d: "Sat", v: 1900, p: 96, met: true },
//   { d: "Sun", v: 1860, p: 102, met: true },
// ];

// const monthlyData = [
//   { d: "Wk 1", v: 1940, p: 105, met: true },
//   { d: "Wk 2", v: 1810, p: 92, met: true },
//   { d: "Wk 3", v: 1760, p: 89, met: false },
//   { d: "Wk 4", v: 1832, p: 97, met: true },
// ];

// const yearlyData = [
//   { d: "Jan", v: 2100, p: 85, met: true },
//   { d: "Feb", v: 1980, p: 90, met: true },
//   { d: "Mar", v: 1950, p: 95, met: true },
//   { d: "Apr", v: 1890, p: 100, met: true },
//   { d: "May", v: 1832, p: 97, met: true },
//   { d: "Jun", v: 1780, p: 105, met: false },
//   { d: "Jul", v: 1750, p: 110, met: false },
//   { d: "Aug", v: 1820, p: 112, met: true },
//   { d: "Sep", v: 1840, p: 115, met: true },
//   { d: "Oct", v: 1810, p: 118, met: true },
//   { d: "Nov", v: 1790, p: 122, met: true },
//   { d: "Dec", v: 1805, p: 125, met: true },
// ];

// function ProgressPage() {
//   // --- STATE MANAGEMENT ---
//   const [timeframe, setTimeframe] = useState<"Week" | "Month" | "Year">("Week");
//   const [selectedStat, setSelectedStat] = useState<string>("Avg calories");
  
//   // Interactive Day Goal checklist state matching the static weeks arrays
//   const [goalDays, setGoalDays] = useState(weeklyData);
//   const [hoveredBar, setHoveredBar] = useState<number | null>(null);

//   // --- DERIVED MEMOIZED METRICS ---
//   const currentChartDataset = useMemo(() => {
//     if (timeframe === "Month") return monthlyData;
//     if (timeframe === "Year") return yearlyData;
//     return goalDays;
//   }, [timeframe, goalDays]);

//   const maxScaleValue = useMemo(() => {
//     const values = currentChartDataset.map((d) => d.v);
//     return Math.max(...values, 2200);
//   }, [currentChartDataset]);

//   const completionMetrics = useMemo(() => {
//     const completed = goalDays.filter((d) => d.met).length;
//     const percentage = Math.round((completed / goalDays.length) * 100);
//     return { completed, percentage };
//   }, [goalDays]);

//   // Dynamic calculations for summary boxes depending on active state edits
//   const calculatedAvgKcal = useMemo(() => {
//     const sum = goalDays.reduce((acc, curr) => acc + curr.v, 0);
//     return Math.round(sum / goalDays.length).toLocaleString();
//   }, [goalDays]);

//   const calculatedAvgProtein = useMemo(() => {
//     const sum = goalDays.reduce((acc, curr) => acc + curr.p, 0);
//     return Math.round(sum / goalDays.length);
//   }, [goalDays]);

//   // --- HANDLERS ---
//   const toggleDayGoalAdherence = (index: number) => {
//     if (timeframe !== "Week") return; // Only allow interactive toggling on current active weekly view
//     setGoalDays((prev) =>
//       prev.map((item, idx) => (idx === index ? { ...item, met: !item.met } : item))
//     );
//   };

//   return (
//     <AppShell>
//       <div className="space-y-6 p-6">
//         <PageHeader
//           eyebrow={timeframe === "Week" ? "Last 7 days" : timeframe === "Month" ? "Last 30 days" : "Calendar year"}
//           title="Your progress"
//           description="Where you're trending across calories, protein and consistency metrics."
//           actions={
//             <div className="flex items-center rounded-xl border border-border bg-card p-1 text-sm font-medium shadow-sm">
//               {(["Week", "Month", "Year"] as const).map((t) => (
//                 <button
//                   key={t}
//                   onClick={() => setTimeframe(t)}
//                   className={`rounded-lg px-4 py-1.5 transition-all text-xs font-semibold ${
//                     timeframe === t ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"
//                   }`}
//                 >
//                   {t}
//                 </button>
//               ))}
//             </div>
//           }
//         />

//         {/* TOP METRIC BLOCKS CARDS */}
//         <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
//           <Stat
//             label="Avg calories"
//             value={timeframe === "Week" ? `${calculatedAvgKcal}` : timeframe === "Month" ? "1,832" : "1,878"}
//             delta="-3%"
//             trend="down"
//             hint="vs. last segment"
//             isActive={selectedStat === "Avg calories"}
//             onClick={() => setSelectedStat("Avg calories")}
//           />
//           <Stat
//             label="Avg protein"
//             value={timeframe === "Week" ? `${calculatedAvgProtein}g` : "97g"}
//             delta="+12%"
//             trend="up"
//             hint="goal 128g"
//             isActive={selectedStat === "Avg protein"}
//             onClick={() => setSelectedStat("Avg protein")}
//           />
//           <Stat
//             label="Adherence"
//             value={timeframe === "Week" ? `${completionMetrics.percentage}%` : "86%"}
//             delta="+5%"
//             trend="up"
//             hint="targets achieved"
//             isActive={selectedStat === "Adherence"}
//             onClick={() => setSelectedStat("Adherence")}
//           />
//           <Stat
//             label="Streak"
//             value={timeframe === "Week" ? "12d" : timeframe === "Month" ? "24d" : "84d"}
//             delta="Best"
//             trend="up"
//             hint="personal record"
//             isActive={selectedStat === "Streak"}
//             onClick={() => setSelectedStat("Streak")}
//           />
//         </div>

//         {/* INTERACTIVE DATA VISUALIZATIONS CHARTS SEGMENT */}
//         <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          
//           {/* BAR + DOT COMBO CHART RELATION */}
//           <Card className="relative overflow-visible">
//             <div className="flex items-end justify-between">
//               <div>
//                 <h3 className="font-display text-xl font-semibold capitalize">{timeframe}ly Breakdown</h3>
//                 <p className="text-sm text-muted-foreground">Bars: kcal · Dots: protein (g)</p>
//               </div>
//               <div className="flex items-center gap-3 text-xs font-medium">
//                 <span className="flex items-center gap-1.5">
//                   <span className="h-2.5 w-2.5 rounded-sm bg-leaf" /> Calories
//                 </span>
//                 <span className="flex items-center gap-1.5">
//                   <span className="h-2.5 w-2.5 rounded-full bg-citrus" /> Protein
//                 </span>
//               </div>
//             </div>

//             {/* DYNAMIC CHART MATRIX */}
//             <div className="mt-12 flex h-64 items-end gap-2 sm:gap-4 relative px-2">
//               {currentChartDataset.map((w, idx) => {
//                 const heightPercentage = (w.v / maxScaleValue) * 100;
//                 const proteinPercentage = (w.p / 140) * 100;
//                 const isHovered = hoveredBar === idx;

//                 return (
//                   <div 
//                     key={w.d} 
//                     className="group relative flex flex-1 flex-col items-center h-full justify-end cursor-pointer"
//                     onMouseEnter={() => setHoveredBar(idx)}
//                     onMouseLeave={() => setHoveredBar(null)}
//                   >
//                     {/* Floating Info Tooltip */}
//                     {isHovered && (
//                       <div className="absolute -top-12 z-20 bg-popover text-popover-foreground border border-border text-[11px] p-2 rounded-xl shadow-xl flex flex-col min-w-[75px] items-center pointer-events-none animate-in fade-in slide-in-from-bottom-2">
//                         <span className="font-bold">{w.v} kcal</span>
//                         <span className="text-citrus font-medium">{w.p}g Protein</span>
//                       </div>
//                     )}

//                     <div className="relative flex h-full w-full items-end">
//                       {/* Calorie Bar */}
//                       <div
//                         className={`w-full rounded-t-lg bg-gradient-to-t from-leaf to-leaf/60 transition-all ${
//                           isHovered ? "brightness-105 scale-x-105" : "opacity-90"
//                         }`}
//                         style={{ height: `${heightPercentage}%` }}
//                       />
//                       {/* Protein Dot Node Marker */}
//                       <div
//                         className={`absolute left-1/2 h-3.5 w-3.5 -translate-x-1/2 rounded-full border-2 border-card bg-citrus shadow-md transition-all ${
//                           isHovered ? "scale-125 ring-2 ring-citrus/30" : ""
//                         }`}
//                         style={{ bottom: `calc(${proteinPercentage}% - 7px)` }}
//                       />
//                     </div>
                    
//                     <div className={`mt-2 text-[11px] font-semibold transition-colors ${isHovered ? "text-primary" : "text-muted-foreground"}`}>
//                       {w.d}
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           </Card>

//           {/* RIGHT SIDEBAR: GOAL COMPLETION PROGRESS RING INTERACTION */}
//           <Card className="flex flex-col justify-between">
//             <div>
//               <h3 className="font-display text-xl font-semibold">Goal completion</h3>
//               <p className="text-sm text-muted-foreground">
//                 {timeframe === "Week" ? "Click days below to toggle compliance log" : "Averages across selected horizon range"}
//               </p>
              
//               <div className="mt-8 flex items-center justify-center">
//                 <div className="relative">
//                   <Ring 
//                     size={180} 
//                     stroke={14} 
//                     value={timeframe === "Week" ? completionMetrics.percentage : 86} 
//                     color="oklch(0.78 0.16 145)" 
//                     track="oklch(0.92 0.01 130)" 
//                   />
//                   <div className="absolute inset-0 flex flex-col items-center justify-center">
//                     <span className="font-display text-4xl font-semibold transition-all">
//                       {timeframe === "Week" ? `${completionMetrics.percentage}%` : "86%"}
//                     </span>
//                     <span className="text-xs text-muted-foreground mt-0.5">
//                       {timeframe === "Week" ? `${completionMetrics.completed} of 7 targets` : "Satisfactory Rate"}
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* INTERACTIVE WEEKDAY TRACKER CHECKLIST GRID */}
//             <div className="mt-8">
//               {timeframe === "Week" ? (
//                 <div className="grid grid-cols-7 gap-1.5">
//                   {goalDays.map((w, i) => (
//                     <button 
//                       key={w.d} 
//                       onClick={() => toggleDayGoalAdherence(i)}
//                       className="text-center group focus:outline-none"
//                       title={`Toggle ${w.d}`}
//                     >
//                       <div
//                         className={`mx-auto h-9 w-full rounded-xl transition-all duration-200 border flex items-center justify-center font-display text-xs ${
//                           w.met 
//                             ? "bg-leaf text-white border-transparent shadow-sm group-hover:bg-leaf/80" 
//                             : "bg-muted text-muted-foreground border-border/80 group-hover:bg-muted/80"
//                         }`}
//                       >
//                         {w.met ? "✓" : "×"}
//                       </div>
//                       <div className="mt-1.5 text-[10px] font-medium text-muted-foreground">{w.d}</div>
//                     </button>
//                   ))}
//                 </div>
//               ) : (
//                 <div className="flex items-center gap-2.5 p-3 rounded-xl bg-muted/50 border border-border/50 text-xs text-muted-foreground">
//                   <Info className="h-4 w-4 text-primary flex-shrink-0" />
//                   <span>Switch context timeline filters back to <strong>Week</strong> view option configuration to toggle individual macro tracking flags.</span>
//                 </div>
//               )}
//             </div>
//           </Card>
//         </div>

//         {/* LOWER REWARDS & ACHIEVEMENTS SHELF */}
//         <Card>
//           <div className="flex items-center gap-3">
//             <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-citrus/25">
//               <Award className="h-5 w-5 text-primary" />
//             </div>
//             <div>
//               <h3 className="font-display text-lg font-semibold">Badges earned this month</h3>
//               <p className="text-sm text-muted-foreground">Milestones unlocked based on nutrition consistency</p>
//             </div>
//           </div>
          
//           <div className="mt-5 grid gap-3 grid-cols-2 sm:grid-cols-4">
//             {[
//               { t: "Hydration hero", s: "7-day streak", c: "bg-leaf-soft" },
//               { t: "Protein pro", s: "5 days hit goal", c: "bg-lavender/25" },
//               { t: "Veggie champ", s: "30+ servings", c: "bg-leaf/20" },
//               { t: "Early bird", s: "Logged before 9am", c: "bg-citrus/25" },
//             ].map((b) => (
//               <div 
//                 key={b.t} 
//                 className={`rounded-2xl ${b.c} p-4 transition-transform hover:scale-[1.02] cursor-help`}
//                 title={`Badge criteria fulfilled for ${b.t}`}
//               >
//                 <Flame className="h-5 w-5 text-primary animate-pulse" />
//                 <div className="mt-3 font-display text-sm font-semibold text-primary">{b.t}</div>
//                 <div className="text-[11px] text-primary/70">{b.s}</div>
//               </div>
//             ))}
//           </div>
//         </Card>
//       </div>
//     </AppShell>
//   );
// }

// // --- EXTRACTED REUSABLE STATISTICAL METRIC BLOCK COMPONENTS ---
// function Stat({
//   label,
//   value,
//   delta,
//   trend,
//   hint,
//   isActive,
//   onClick,
// }: {
//   label: string;
//   value: string;
//   delta: string;
//   trend: "up" | "down";
//   hint: string;
//   isActive: boolean;
//   onClick: () => void;
// }) {
//   const TrendIcon = trend === "up" ? TrendingUp : TrendingDown;
//   const color = trend === "up" ? "text-leaf" : "text-berry";
  
//   return (
//     <Card 
//       onClick={onClick}
//       className={`cursor-pointer transition-all ${
//         isActive 
//           ? "ring-2 ring-primary border-transparent bg-background shadow-md transform -translate-y-0.5" 
//           : "hover:border-border/80 hover:bg-muted/10"
//       }`}
//     >
//       <div className="flex items-center justify-between">
//         <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
//           {label}
//         </span>
//         <span className={`flex items-center gap-1 text-xs font-semibold ${color}`}>
//           <TrendIcon className="h-3.5 w-3.5" /> {delta}
//         </span>
//       </div>
//       <div className="mt-3 font-display text-3xl font-semibold tracking-tight">{value}</div>
//       <div className="text-xs text-muted-foreground mt-0.5">{hint}</div>
//     </Card>
//   );
// }