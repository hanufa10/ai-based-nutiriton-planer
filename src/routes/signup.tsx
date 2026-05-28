import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles, ArrowRight, Activity } from "lucide-react";

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
    const response = await fetch("https://nutiplanner-api-2.onrender.com/user/create", {
      method: "POST",
      headers: {
        "accept": "*/*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: formData.name, 
        email: formData.email,
        password: formData.password,
        role: "user", 
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Handles backend-specific errors (e.g., 400 Bad Request, 409 Conflict)
      throw new Error(data.message || `Server responded with status: ${response.status}`);
    }

    console.log("Success! Account created:", data);
    
    // Auto-login the user using the credentials returned from registration
    if (data.token) {
      localStorage.setItem("auth_token", data.token);
      localStorage.setItem("user_profile", JSON.stringify(data.user));
    }
    
    navigate({ to: "/onboarding" });
  } catch (err: any) {
    // Enhanced Frontend Debugging Logic
    console.error("Full Fetch Error Object:", err);

    let detailedErrorMessage = "";

    if (err instanceof TypeError && err.message === "Failed to fetch") {
      detailedErrorMessage = 
        "Network Error (Failed to fetch). This typically means: \n" +
        "1. Your backend has blocked this request due to a missing CORS configuration.\n" +
        "2. The server endpoint is completely unreachable or dropped the connection.";
    } else {
      // Captures any other runtime or parsing errors
      detailedErrorMessage = `Error Name: ${err.name} \nMessage: ${err.message}`;
    }

    setError(detailedErrorMessage);
  } finally {
    setIsLoading(false);
  }
}; // Beautifully closed function block

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      {/* Form Pane */}
      <div className="flex flex-col justify-between p-6 sm:p-12 lg:p-20 bg-background">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Activity className="h-5 w-5 text-leaf" />
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