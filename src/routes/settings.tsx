import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { User, Target, Bell, Shield, CreditCard, Check, ChevronUp, ChevronDown } from "lucide-react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Card } from "@/components/ui-bits";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — NutriSmart" },
      { name: "description", content: "Manage your profile, goals, notifications and billing." },
    ],
  }),
  component: SettingsPage,
});

const navigationSections = [
  { id: "profile", label: "Profile", icon: User },
  { id: "goals", label: "Goals & macros", icon: Target },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "privacy", label: "Privacy", icon: Shield },
  { id: "billing", label: "Billing", icon: CreditCard },
];

function SettingsPage() {
  // --- STATE MANAGEMENT ---
  const [activeSection, setActiveSection] = useState("profile");
  const [showToast, setShowToast] = useState(false);

  // Profile Form States
  const [profile, setProfile] = useState({
    displayName: "Maya Chen",
    email: "maya.chen@example.com",
    dob: "March 14, 1992",
    timeZone: "(GMT-5) New York"
  });

  // Macro Target States
  const [macros, setMacros] = useState({
    calories: 1950,
    protein: 128,
    carbs: 240,
    fat: 70
  });

  // Toggle States
  const [autoBalance, setAutoBalance] = useState(true);
  const [notifications, setNotifications] = useState({
    mealReminders: true,
    hydrationPings: true,
    weeklyRecap: false,
    coachInsights: true
  });

  // --- HANDLERS ---
  const updateMacro = (key: keyof typeof macros, amount: number) => {
    setMacros(prev => ({ ...prev, [key]: Math.max(0, prev[key] + amount) }));
  };

  const handleSave = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <AppShell>
      <div className="space-y-6 p-6 relative">
        <PageHeader
          eyebrow="Account"
          title="Settings"
          description="Tune your goals, notifications and how Sage talks to you."
        />

        {/* TOAST SUCCESS BANNER */}
        {showToast && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-leaf px-4 py-3 text-sm font-semibold text-white shadow-xl animate-in slide-in-from-bottom-4">
            <Check className="h-4 w-4 stroke-[3]" />
            <span>Changes successfully synchronized!</span>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
          
          {/* NAVIGATION SIDEBAR */}
          <nav className="h-fit rounded-2xl border border-border bg-card p-2 shadow-sm">
            {navigationSections.map((s) => {
              const Icon = s.icon;
              const isSelected = activeSection === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${
                    isSelected
                      ? "bg-leaf-soft text-primary shadow-xs"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {s.label}
                </button>
              );
            })}
          </nav>

          {/* MAIN CONFIGURATION INTERFACE */}
          <div className="space-y-6">
            
            {/* VIEW PROFILE LAYER */}
            {activeSection === "profile" && (
              <>
                <Card>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-leaf to-citrus font-display text-xl font-bold text-primary shadow-sm">
                      MC
                    </div>
                    <div className="flex-1">
                      <h3 className="font-display text-xl font-semibold">{profile.displayName}</h3>
                      <p className="text-sm text-muted-foreground">{profile.email} · Pro plan</p>
                    </div>
                    <button className="rounded-xl border border-border px-3 py-2 text-xs font-semibold hover:bg-muted transition-colors">
                      Change photo
                    </button>
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <Field 
                      label="Display name" 
                      value={profile.displayName} 
                      onChange={(val) => setProfile(p => ({ ...p, displayName: val }))} 
                    />
                    <Field 
                      label="Email" 
                      value={profile.email} 
                      onChange={(val) => setProfile(p => ({ ...p, email: val }))} 
                    />
                    <Field 
                      label="Date of birth" 
                      value={profile.dob} 
                      onChange={(val) => setProfile(p => ({ ...p, dob: val }))} 
                    />
                    <Field 
                      label="Time zone" 
                      value={profile.timeZone} 
                      onChange={(val) => setProfile(p => ({ ...p, timeZone: val }))} 
                    />
                  </div>
                </Card>

                {/* TARGETS PREVIEW FROM PROFILE HUB */}
                <Card>
                  <h3 className="font-display text-xl font-semibold">Daily targets</h3>
                  <p className="text-sm text-muted-foreground">Sage uses these to build your plans.</p>

                  <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Target_ label="Calories" value={macros.calories} unit="kcal" onIncrement={() => updateMacro("calories", 50)} onDecrement={() => updateMacro("calories", -50)} />
                    <Target_ label="Protein" value={macros.protein} unit="g" onIncrement={() => updateMacro("protein", 5)} onDecrement={() => updateMacro("protein", -5)} />
                    <Target_ label="Carbs" value={macros.carbs} unit="g" onIncrement={() => updateMacro("carbs", 5)} onDecrement={() => updateMacro("carbs", -5)} />
                    <Target_ label="Fat" value={macros.fat} unit="g" onIncrement={() => updateMacro("fat", 2)} onDecrement={() => updateMacro("fat", -2)} />
                  </div>

                  <div className="mt-5 rounded-2xl bg-leaf-soft p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-primary">Auto-balance</div>
                      <p className="mt-0.5 text-xs text-primary/70 max-w-xl">
                        Let Sage adjust macros by ±10% on training vs. rest days automatically.
                      </p>
                    </div>
                    <Toggle on={autoBalance} onToggle={() => setAutoBalance(!autoBalance)} />
                  </div>
                </Card>

                {/* NOTIFICATIONS CONTAINER HUB */}
                <Card>
                  <h3 className="font-display text-xl font-semibold">Notifications</h3>
                  <div className="mt-4 divide-y divide-border">
                    <Row 
                      title="Meal reminders" 
                      desc="Nudge me 15 min before each planned meal" 
                      on={notifications.mealReminders} 
                      onToggle={() => setNotifications(n => ({ ...n, mealReminders: !n.mealReminders }))} 
                    />
                    <Row 
                      title="Hydration pings" 
                      desc="Every 90 minutes between 8am – 8pm" 
                      on={notifications.hydrationPings} 
                      onToggle={() => setNotifications(n => ({ ...n, hydrationPings: !n.hydrationPings }))} 
                    />
                    <Row 
                      title="Weekly recap" 
                      desc="Sunday 7pm summary email" 
                      on={notifications.weeklyRecap} 
                      onToggle={() => setNotifications(n => ({ ...n, weeklyRecap: !n.weeklyRecap }))} 
                    />
                    <Row 
                      title="Coach insights" 
                      desc="When Sage spots a pattern worth knowing" 
                      on={notifications.coachInsights} 
                      onToggle={() => setNotifications(n => ({ ...n, coachInsights: !n.coachInsights }))} 
                    />
                  </div>
                </Card>
              </>
            )}

            {/* FALLBACK ISOLATION VIEWS FOR INDEPENDENT TABS */}
            {activeSection !== "profile" && (
              <Card className="flex flex-col items-center justify-center py-16 text-center">
                <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center text-muted-foreground mb-4">
                  <SettingsIcon section={activeSection} />
                </div>
                <h3 className="font-display text-lg font-semibold capitalize">{activeSection} Control Matrix</h3>
                <p className="text-xs text-muted-foreground max-w-xs mt-1">
                  Advanced dashboard views are wired under mock environment configurations. Complete profile data updates using the main tab parameters.
                </p>
                <button 
                  onClick={() => setActiveSection("profile")} 
                  className="mt-4 text-xs font-bold text-leaf hover:underline"
                >
                  ← Return to Profile Profile
                </button>
              </Card>
            )}

            {/* ACTION TRIGGERS BAR CONTAINER */}
            <div className="flex justify-end gap-2 pt-2">
              <button className="rounded-xl border border-border px-4 py-2.5 text-xs font-semibold hover:bg-muted transition-colors">
                Cancel
              </button>
              <button 
                onClick={handleSave}
                className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground hover:opacity-90 transition-opacity shadow-sm"
              >
                <Check className="h-4 w-4 stroke-[2.5]" /> Save changes
              </button>
            </div>

          </div>
        </div>
      </div>
    </AppShell>
  );
}

// --- SUB-ELEMENT ATOMS ---
function Field({ label, value, onChange }: { label: string; value: string; onChange: (val: string) => void }) {
  return (
    <label className="block">
      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 h-11 w-full rounded-xl border border-border bg-muted/40 px-3 text-sm focus:bg-background focus:outline-none focus:ring-2 focus:ring-ring/40 transition-all font-medium"
      />
    </label>
  );
}

function Target_({ 
  label, 
  value, 
  unit, 
  onIncrement, 
  onDecrement 
}: { 
  label: string; 
  value: number; 
  unit: string; 
  onIncrement: () => void; 
  onDecrement: () => void; 
}) {
  return (
    <div className="rounded-2xl border border-border p-4 bg-card shadow-xs flex justify-between items-center group relative">
      <div>
        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        <div className="mt-1 flex items-baseline gap-0.5">
          <span className="font-display text-2xl font-bold tracking-tight">{value.toLocaleString()}</span>
          <span className="text-[10px] font-semibold text-muted-foreground">{unit}</span>
        </div>
      </div>

      {/* STEPPER CONTROLS */}
      <div className="flex flex-col gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
        <button 
          type="button"
          onClick={onIncrement}
          className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronUp className="h-3.5 w-3.5" />
        </button>
        <button 
          type="button"
          onClick={onDecrement}
          className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none ${
        on ? "bg-primary" : "bg-muted"
      }`}
    >
      <span
        className={`h-5 w-5 transform rounded-full bg-card shadow-sm transition-transform ${
          on ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

function Row({ title, desc, on, onToggle }: { title: string; desc: string; on: boolean; onToggle: () => void }) {
  return (
    <div className="flex items-center justify-between py-4 first:pt-0 last:pb-0 gap-4">
      <div>
        <div className="text-sm font-semibold">{title}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>
      </div>
      <Toggle on={on} onToggle={onToggle} />
    </div>
  );
}

function SettingsIcon({ section }: { section: string }) {
  switch (section) {
    case "goals": return <Target className="h-5 w-5" />;
    case "notifications": return <Bell className="h-5 w-5" />;
    case "privacy": return <Shield className="h-5 w-5" />;
    case "billing": return <CreditCard className="h-5 w-5" />;
    default: return <User className="h-5 w-5" />;
  }
}