import { createFileRoute } from "@tanstack/react-router";
import { Sparkles, Send, Lightbulb, Salad, Dumbbell, Droplets } from "lucide-react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Card } from "@/components/ui-bits";

export const Route = createFileRoute("/coach")({
  head: () => ({
    meta: [
      { title: "AI Coach — NutriSmart" },
      { name: "description", content: "Personalized coaching that learns from your meals and goals." },
    ],
  }),
  component: CoachPage,
});

const messages = [
  { from: "coach", text: "Morning, Maya. I noticed your protein dipped Wednesday. Want me to add a 20g snack to today's plan?" },
  { from: "user", text: "Yes please — keep it under 200 kcal." },
  { from: "coach", text: "Done. I added a Greek yogurt + almond cup at 3:30 PM (180 kcal, 22g protein). Closes your ring nicely." },
];

const prompts = [
  { icon: Salad, t: "Suggest a low-carb dinner using salmon" },
  { icon: Dumbbell, t: "Build a high-protein day for leg day" },
  { icon: Droplets, t: "Why am I always thirsty in the afternoon?" },
];

function CoachPage() {
  return (
    <AppShell>
      <div className="space-y-6 p-6">
        <PageHeader
          eyebrow="Always learning"
          title="AI coach"
          description="Ask anything about meals, macros or training. I remember your preferences and goals."
        />

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <Card className="flex h-[600px] flex-col p-0">
            <div className="flex items-center gap-3 border-b border-border px-6 py-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
                <Sparkles className="h-5 w-5 text-leaf" />
              </div>
              <div>
                <div className="font-display text-base font-semibold">Sage</div>
                <div className="text-xs text-leaf">● Online · personalized for Maya</div>
              </div>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto px-6 py-6">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      m.from === "user"
                        ? "rounded-br-sm bg-primary text-primary-foreground"
                        : "rounded-bl-sm bg-leaf-soft text-primary"
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-sm bg-muted px-4 py-3">
                  <div className="flex gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" />
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-border p-4">
              <div className="flex items-center gap-2 rounded-2xl border border-border bg-muted/40 px-4 py-2 focus-within:bg-background focus-within:ring-2 focus-within:ring-ring/40">
                <input
                  placeholder="Ask Sage anything…"
                  className="flex-1 bg-transparent py-2 text-sm focus:outline-none"
                />
                <button className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground hover:opacity-90">
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </Card>

          <div className="space-y-4">
            <Card>
              <div className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-citrus" />
                <h3 className="font-display text-lg font-semibold">Try asking</h3>
              </div>
              <div className="mt-4 space-y-2">
                {prompts.map((p) => {
                  const Icon = p.icon;
                  return (
                    <button
                      key={p.t}
                      className="flex w-full items-start gap-3 rounded-xl border border-border bg-card p-3 text-left text-sm transition-all hover:border-leaf hover:bg-leaf-soft"
                    >
                      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-leaf" />
                      <span>{p.t}</span>
                    </button>
                  );
                })}
              </div>
            </Card>

            <Card className="bg-[var(--gradient-hero)] text-primary-foreground">
              <div className="text-xs font-semibold uppercase tracking-wider text-primary-foreground/70">
                Sage knows
              </div>
              <ul className="mt-3 space-y-2 text-sm">
                <li>• Vegetarian, no shellfish</li>
                <li>• Goal: 128g protein / day</li>
                <li>• Trains 4x weekly (strength)</li>
                <li>• Avoids ultra-processed foods</li>
              </ul>
              <button className="mt-4 text-sm font-semibold text-leaf hover:underline">
                Update preferences →
              </button>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
