import { createFileRoute } from "@tanstack/react-router";
import { User, Target, Bell, Shield, CreditCard, Check } from "lucide-react";
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

const sections = [
  { id: "profile", label: "Profile", icon: User, active: true },
  { id: "goals", label: "Goals & macros", icon: Target },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "privacy", label: "Privacy", icon: Shield },
  { id: "billing", label: "Billing", icon: CreditCard },
];

function SettingsPage() {
  return (
    <AppShell>
      <div className="space-y-6 p-6">
        <PageHeader
          eyebrow="Account"
          title="Settings"
          description="Tune your goals, notifications and how Sage talks to you."
        />

        <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
          <nav className="h-fit rounded-2xl border border-border bg-card p-2">
            {sections.map((s) => {
              const Icon = s.icon;
              return (
                <button
                  key={s.id}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                    s.active
                      ? "bg-leaf-soft text-primary"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {s.label}
                </button>
              );
            })}
          </nav>

          <div className="space-y-6">
            <Card>
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-leaf to-citrus font-display text-xl font-semibold text-primary">
                  MC
                </div>
                <div className="flex-1">
                  <h3 className="font-display text-xl font-semibold">Maya Chen</h3>
                  <p className="text-sm text-muted-foreground">maya.chen@example.com · Pro plan</p>
                </div>
                <button className="rounded-xl border border-border px-3 py-2 text-sm font-medium hover:bg-muted">
                  Change photo
                </button>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <Field label="Display name" value="Maya Chen" />
                <Field label="Email" value="maya.chen@example.com" />
                <Field label="Date of birth" value="March 14, 1992" />
                <Field label="Time zone" value="(GMT-5) New York" />
              </div>
            </Card>

            <Card>
              <h3 className="font-display text-xl font-semibold">Daily targets</h3>
              <p className="text-sm text-muted-foreground">Sage uses these to build your plans.</p>

              <div className="mt-5 grid gap-3 sm:grid-cols-4">
                <Target_ label="Calories" value="1,950" unit="kcal" />
                <Target_ label="Protein" value="128" unit="g" />
                <Target_ label="Carbs" value="240" unit="g" />
                <Target_ label="Fat" value="70" unit="g" />
              </div>

              <div className="mt-5 rounded-2xl bg-leaf-soft p-4">
                <div className="text-sm font-semibold text-primary">Auto-balance</div>
                <p className="mt-1 text-xs text-primary/70">
                  Let Sage adjust macros by ±10% on training vs. rest days.
                </p>
                <Toggle on />
              </div>
            </Card>

            <Card>
              <h3 className="font-display text-xl font-semibold">Notifications</h3>
              <div className="mt-4 divide-y divide-border">
                <Row title="Meal reminders" desc="Nudge me 15 min before each planned meal" on />
                <Row title="Hydration pings" desc="Every 90 minutes between 8am – 8pm" on />
                <Row title="Weekly recap" desc="Sunday 7pm summary email" on={false} />
                <Row title="Coach insights" desc="When Sage spots a pattern worth knowing" on />
              </div>
            </Card>

            <div className="flex justify-end gap-2">
              <button className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium hover:bg-muted">
                Cancel
              </button>
              <button className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90">
                <Check className="h-4 w-4" /> Save changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <input
        defaultValue={value}
        className="mt-1.5 h-11 w-full rounded-xl border border-border bg-muted/40 px-3 text-sm focus:bg-background focus:outline-none focus:ring-2 focus:ring-ring/40"
      />
    </label>
  );
}

function Target_({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="rounded-2xl border border-border p-4">
      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="font-display text-2xl font-semibold">{value}</span>
        <span className="text-xs text-muted-foreground">{unit}</span>
      </div>
    </div>
  );
}

function Toggle({ on }: { on: boolean }) {
  return (
    <button
      className={`mt-3 inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        on ? "bg-primary" : "bg-muted"
      }`}
    >
      <span
        className={`h-5 w-5 transform rounded-full bg-card shadow transition-transform ${
          on ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

function Row({ title, desc, on }: { title: string; desc: string; on: boolean }) {
  return (
    <div className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
      <div>
        <div className="text-sm font-semibold">{title}</div>
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
      <Toggle on={on} />
    </div>
  );
}
