import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Brain,
  Droplets,
  CheckCircle2,
  Salad,
  Flame,
  ArrowRight,
  TrendingUp,
  Activity
} from "lucide-react";
import { AppShell } from "@/components/app-shell";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NutriSmart — Your AI-Powered Personal Nutritionist" },
      { name: "description", content: "Plan meals, track macros, and achieve your health goals with intelligent AI guidance." },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground selection:bg-leaf selection:text-primary-foreground">
      {/* Navigation Bar */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-border/50 bg-background/80 px-6 py-4 backdrop-blur-md">
        <div className="flex items-center gap-2">
<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white">            <img
  src="/fav.png"
  alt="NutriSmart Logo"
  className="h-5 w-5 object-contain"
/>
          </div>
          <span className="font-display text-lg font-bold tracking-tight">NutriSmart</span>
        </div>
        <nav className="flex items-center gap-4">
          <Link
            to="/login"
            className="text-sm font-semibold text-foreground hover:text-leaf transition-colors"
          >
            Log In
          </Link>
          <Link
            to="/signup"
            className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-soft)] transition-transform hover:-translate-y-0.5"
          >
            Get Started Free
          </Link>
        </nav>
      </header>

      <main>
        {/* HERO SECTION */}
        <section className="relative overflow-hidden px-6 pt-24 pb-32 sm:px-12 xl:px-24">
          <div
            aria-hidden
            className="absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-leaf-soft/40 blur-3xl"
          />
          <div
            aria-hidden
            className="absolute -left-40 top-40 h-[500px] w-[500px] rounded-full bg-citrus/10 blur-3xl"
          />
          
          <div className="relative mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm font-medium shadow-sm mb-6">
              <span className="flex h-2 w-2 rounded-full bg-leaf animate-pulse" />
              NutriSmart Engine is live
            </div>
            
            <h1 className="font-display text-5xl font-bold leading-[1.1] tracking-tight sm:text-7xl">
              Your AI-Powered <br className="hidden sm:block" />
              <span className="text-leaf">Personal Nutritionist</span>
            </h1>
            
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed sm:text-xl">
              Stop guessing, start planning. Get highly personalized meal plans, track your macros dynamically, and receive real-time AI adjustments based on your goals.
            </p>
            
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                to="/signup"
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-8 py-4 text-base font-bold text-primary-foreground shadow-[0_8px_24px_-8px] shadow-primary/40 transition-transform hover:-translate-y-1 sm:w-auto"
              >
                Get Started Free <ArrowRight className="h-5 w-5 text-leaf" />
              </Link>
              <Link
                to="/login"
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-card px-8 py-4 text-base font-bold text-foreground transition-colors hover:bg-muted sm:w-auto"
              >
                Log In
              </Link>
            </div>
          </div>
        </section>

        {/* SOCIAL PROOF BAR */}
        <section className="border-y border-border bg-card py-10">
          <div className="mx-auto flex max-w-6xl flex-wrap justify-center gap-8 px-6 sm:justify-between sm:gap-4 xl:px-0">
            {[
              { label: "Meal Plans Generated", value: "10,000+" },
              { label: "Foods in Database", value: "50,000+" },
              { label: "User Goal Achievement", value: "95%" },
              { label: "AI-Powered Suggestions", value: "Real-time" }
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="font-display text-3xl font-bold text-foreground">{stat.value}</div>
                <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="px-6 py-24 sm:px-12 xl:px-24">
          <div className="mx-auto max-w-6xl">
            <div className="text-center">
              <h2 className="font-display text-3xl font-bold sm:text-4xl">How it works</h2>
              <p className="mt-4 text-muted-foreground">Three simple steps to build your nutritional foundation.</p>
            </div>

            <div className="mt-16 grid gap-12 sm:grid-cols-3 sm:gap-8 relative">
              <div className="hidden sm:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-leaf-soft via-border to-transparent -z-10" />
              
              <div className="relative text-center">
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-leaf-soft text-primary shadow-sm mb-6">
                  <TrendingUp className="h-10 w-10 text-leaf" />
                </div>
                <h3 className="font-display text-xl font-bold">1. Set your goals</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Define your targets—weight loss, muscle gain, or maintenance. We tailor the engine to your profile.
                </p>
              </div>

              <div className="relative text-center">
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-citrus/20 text-primary shadow-sm mb-6">
                  <Brain className="h-10 w-10 text-citrus" />
                </div>
                <h3 className="font-display text-xl font-bold">2. Get your plan</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Our AI builds personalized daily meal plans covering all macronutrient requirements perfectly.
                </p>
              </div>

              <div className="relative text-center">
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-lavender/20 text-primary shadow-sm mb-6">
                  <img
  src="/fav.png"
  alt="Logo"
  className="h-5 w-5 object-contain"
/>
                </div>
                <h3 className="font-display text-xl font-bold">3. Track & Adjust</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Log your progress and let the engine instantly adapt your targets based on real-time feedback.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CORE FEATURES SECTION */}
        <section className="bg-muted/30 px-6 py-24 sm:px-12 xl:px-24">
          <div className="mx-auto max-w-6xl">
            <div className="mb-16">
              <h2 className="font-display text-3xl font-bold sm:text-4xl">Everything you need</h2>
              <p className="mt-4 max-w-2xl text-muted-foreground">
                NutriSmart combines powerful tracking with proactive AI suggestions to keep you accountable.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { icon: Salad, bg: "bg-leaf-soft", color: "text-leaf", title: "Personalised Meal Plans", desc: "AI builds plans around your goals, dietary preferences, and macro restrictions." },
                { icon: Flame, bg: "bg-citrus/20", color: "text-citrus", title: "Macro & Calorie Tracking", desc: "Real-time nutritional breakdown for every single meal logged in your diary." },
                { icon: Brain, bg: "bg-lavender/20", color: "text-lavender", title: "AI Recommendations", desc: "Smart meal swapping suggestions that learn from your habits and adjust macros." },
                { icon: TrendingUp, bg: "bg-berry/15", color: "text-berry", title: "Progress Dashboard", desc: "Beautiful visual health insights to track your streak and weight journey." },
                { icon: Droplets, bg: "bg-leaf-soft", color: "text-leaf", title: "Hydration Tracking", desc: "Log your daily water intake with simple controls and hit your liquid goals." },
                { icon: CheckCircle2, bg: "bg-citrus/20", color: "text-citrus", title: "Instant Adjustments", desc: "Swap meals, update goals, and recalculate everything instantly with one tap." },
              ].map((feature, i) => (
                <div key={i} className="rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-soft)] transition-transform hover:-translate-y-1">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${feature.bg}`}>
                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <h3 className="mt-6 font-display text-lg font-bold">{feature.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FINAL CTA SECTION */}
        <section className="relative overflow-hidden bg-[var(--gradient-hero)] px-6 py-24 sm:px-12 xl:px-24">
          <div
            aria-hidden
            className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"
          />
          <div className="relative mx-auto max-w-3xl text-center text-primary-foreground">
            <h2 className="font-display text-4xl font-bold sm:text-5xl" style={{ color: "oklch(0.27 0.05 145)" }}>
              Start eating smarter today
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg text-primary-foreground/80" style={{ color: "oklch(0.27 0.05 145)" }}>
              Join thousands of people hitting their nutrition goals with precision AI guidance.
            </p>
            <div className="mt-10 flex justify-center">
              <Link
                to="/signup"
                className="flex items-center gap-2 rounded-2xl bg-primary px-8 py-4 text-base font-bold text-primary-foreground shadow-xl transition-transform hover:-translate-y-1"
                style={{ color: "oklch(0.98 0.01 130)", backgroundColor: "oklch(0.22 0.04 145)" }}
              >
                Create Free Account <ArrowRight className="h-5 w-5 text-leaf" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-border bg-background px-6 py-12 sm:px-12 xl:px-24">
        <div className="mx-auto max-w-6xl grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white">
               <img
  src="/fav.png"
  alt="Logo"
  className="h-4 w-4 object-contain"
/>
              </div>
              <span className="font-display text-lg font-bold tracking-tight">NutriSmart</span>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Your intelligent partner for achieving real health and nutrition results.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold">Product</h4>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li><a href="#features" className="hover:text-leaf">Features</a></li>
              <li><a href="#pricing" className="hover:text-leaf">Pricing</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold">Company</h4>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li><a href="/about" className="hover:text-leaf">About</a></li>
              <li><a href="/contact" className="hover:text-leaf">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold">Legal</h4>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li><a href="/privacy" className="hover:text-leaf">Privacy Policy</a></li>
              <li><a href="/terms" className="hover:text-leaf">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        
        <div className="mx-auto mt-12 max-w-6xl border-t border-border pt-8 text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} NutriSmart Inc. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
