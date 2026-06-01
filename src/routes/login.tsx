import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Activity, Flame, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { ApiError, login } from "@/lib/api";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign In — NutriSmart" },
      { name: "description", content: "Access your personalized NutriSmart engine." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    console.log("Login button clicked");
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const data = await login(formData.email, formData.password);
      setSuccessMessage(data.message || "Login successful!");

      setTimeout(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const callbackUrl = searchParams.get("callbackUrl");

        if (callbackUrl) {
          navigate({ to: callbackUrl });
        } else {
          navigate({ to: "/dashboard" });
        }
      }, 800);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
      } else if (err instanceof TypeError && err.message === "Failed to fetch") {
        setErrorMessage("Cannot reach the API. Check your connection and VITE_API_BASE_URL in .env.");
      } else if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
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
            Welcome back.
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Pick up right where you left your streak.
          </p>

          {errorMessage && (
            <div className="mt-6 flex items-start gap-3 rounded-xl bg-berry/10 p-4 text-xs font-medium text-berry border border-berry/20 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span className="whitespace-pre-wrap">{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mt-6 flex items-start gap-3 rounded-xl bg-leaf-soft p-4 text-xs font-semibold text-primary border border-leaf/20 animate-in fade-in slide-in-from-top-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-leaf" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                Email Address
              </label>
              <input
                required
                type="email"
                disabled={isLoading}
                placeholder="hanan@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm placeholder:text-muted-foreground/50 focus:border-leaf focus:outline-none focus:ring-1 focus:ring-leaf disabled:opacity-60 transition-all font-medium"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Password
                </label>
                <a href="#" className="text-xs font-bold text-leaf hover:underline">
                  Forgot password?
                </a>
              </div>
              <input
                required
                type="password"
                disabled={isLoading}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm placeholder:text-muted-foreground/50 focus:border-leaf focus:outline-none focus:ring-1 focus:ring-leaf disabled:opacity-60 transition-all font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground shadow-[var(--shadow-soft)] transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:pointer-events-none active:scale-[0.99]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 text-leaf animate-spin" />
                  Verifying ...
                </>
              ) : (
                <>
                  Sign In <ArrowRight className="h-4 w-4 text-leaf" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground font-medium">
            Don&apos;t have an account?{" "}
            <Link to="/signup" className="font-bold text-leaf hover:underline">
              Create one free
            </Link>
          </p>
        </div>

        <div className="text-xs font-medium text-muted-foreground/50">
          &copy; 2026 NutriSmart Inc. All rights reserved.
        </div>
      </div>

      <div className="relative hidden overflow-hidden bg-[var(--foreground)] p-12 lg:flex lg:flex-col lg:justify-between">
        <div aria-hidden className="absolute -left-20 -bottom-20 h-96 w-96 rounded-full bg-berry/15 blur-3xl" />
        <div aria-hidden className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-lavender/20 blur-3xl" />

        <div className="relative ml-auto max-w-[240px] rounded-2xl bg-white/10 p-4 text-primary-foreground ring-1 ring-white/15 backdrop-blur-md shadow-lg">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-citrus animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider opacity-90">Daily Fuel Burn</span>
          </div>
          <div className="mt-2 font-display text-3xl font-bold">
            2,450 <span className="text-sm font-normal text-primary-foreground/70">kcal</span>
          </div>
        </div>

        <div className="relative mt-auto max-w-xl text-primary-foreground">
          <h2 className="font-display text-4xl font-semibold leading-tight tracking-tight">
            Intelligent design for precise health goals.
          </h2>
          <p className="mt-4 max-w-md text-sm font-medium text-primary-foreground/70 leading-relaxed">
            Log back in to sync your smart scales, check your customized AI meal variants, and track your
            hydration targets.
          </p>
        </div>
      </div>
    </div>
  );
}
