import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles, ArrowRight, Activity } from "lucide-react";
import { ApiError, signUp } from "@/lib/api";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Join NutriSmart — Create Account" },
      { name: "description", content: "Start your journey to intelligent, AI-driven nutrition." },
    ],
  }),
  component: SignUpPage,
});

function SignUpPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);
  setError(null);

  try {
    await signUp({
      username: formData.name,
      email: formData.email,
      password: formData.password,
    });
    navigate({ to: "/onboarding" });
  } catch (err: unknown) {
    // Enhanced Frontend Debugging Logic
    console.error("Full Fetch Error Object:", err);

    if (err instanceof ApiError) {
      const body = err.body as { error?: { code?: string; meta?: { target?: string[] } } } | undefined;
      if (body?.error?.code === "P2002") {
        const target = body.error.meta?.target || [];
        if (target.includes("username")) {
          setError("This username is already taken. Please try another one.");
          return;
        }
        if (target.includes("email")) {
          setError("An account with this email already exists. Please sign in instead.");
          return;
        }
      }
      setError(err.message);
    } else if (err instanceof TypeError && err.message === "Failed to fetch") {
      setError("Cannot reach the API. Check VITE_API_BASE_URL in .env and restart the dev server.");
    } else if (err instanceof Error) {
      setError(err.message);
    } else {
      setError("An unexpected error occurred. Please try again.");
    }
  } finally {
    setIsLoading(false);
  }
}; // Beautifully closed function block

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      {/* Form Pane */}
      <div className="flex flex-col justify-between p-6 sm:p-12 lg:p-20 bg-background">
        <div className="flex items-center gap-2">
         <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white">      <img
  src="/fav.png"
  alt="Logo"
  className="h-5 w-5 object-contain"
/>
          </div>
          <span className="font-display text-xl font-bold tracking-tight">NutriSmart</span>
        </div>

        <div className="mx-auto w-full max-w-md my-auto py-12">
          <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Start your journey.
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Get personalized nutrition, real-time tracking, and AI coaching.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {error && (
              <div className="rounded-xl bg-destructive/10 p-3 text-sm font-medium text-destructive">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                First Name
              </label>
              <input
                required
                type="text"
                disabled={isLoading}
                placeholder="Maya"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm placeholder:text-muted-foreground/50 focus:border-leaf focus:outline-none focus:ring-1 focus:ring-leaf disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                Email Address
              </label>
              <input
                required
                type="email"
                disabled={isLoading}
                placeholder="maya@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm placeholder:text-muted-foreground/50 focus:border-leaf focus:outline-none focus:ring-1 focus:ring-leaf disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                Password
              </label>
              <input
                required
                type="password"
                disabled={isLoading}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm placeholder:text-muted-foreground/50 focus:border-leaf focus:outline-none focus:ring-1 focus:ring-leaf disabled:opacity-50"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-soft)] transition-transform hover:-translate-y-0.5 disabled:opacity-70 disabled:pointer-events-none"
            >
              {isLoading ? "Creating Account..." : "Create Account"} <ArrowRight className="h-4 w-4 text-leaf" />
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-leaf hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        <div className="text-xs text-muted-foreground/60">
          &copy; 2026 NutriSmart Inc. All rights reserved.
        </div>
      </div>

      {/* Hero Visual Pane */}
      <div className="relative hidden overflow-hidden bg-[var(--foreground)] p-12 lg:flex lg:flex-col lg:justify-between">
        <div aria-hidden className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-leaf/20 blur-3xl" />
        <div aria-hidden className="absolute -bottom-20 left-10 h-96 w-96 rounded-full bg-citrus/10 blur-3xl" />
        
        <div className="relative ml-auto max-w-sm rounded-2xl bg-white/10 p-4 text-primary-foreground ring-1 ring-white/15 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-leaf" />
            <span className="text-xs font-semibold uppercase tracking-wider">AI Insight</span>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-primary-foreground/90">
            "NutriSmart tailored my macro split exactly around my morning running routines. Lost 4kg without feeling like I was starving."
          </p>
          <div className="mt-3 text-xs font-medium text-primary-foreground/70">— Sarah M., Runner</div>
        </div>

        <div className="relative mt-auto max-w-xl text-primary-foreground">
          <h2 className="font-display text-4xl font-semibold leading-tight">
            Your body runs on metrics, not guesswork.
          </h2>
          <p className="mt-4 max-w-md text-sm text-primary-foreground/70">
            Ditch the generic calorie trackers. Experience a nutrition ecosystem that adapts instantly to your active lifestyle.
          </p>
        </div>
      </div>
    </div>
  );
}