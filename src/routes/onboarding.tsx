import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Sparkles, Dumbbell, Target, Scale, Check, Loader2 } from "lucide-react";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Set Up Your Profile — NutriSmart" },
    ],
  }),
  component: OnboardingPage,
});

type Step = 1 | 2 | 3;

interface StoredUserSession {
  userId: number;
  username: string;
  email: string;
  role: string;
  createdAt: string;
}

function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);

  const [profile, setProfile] = useState({
    fullName: "",
    goal: "maintain",
    activity: "moderate",
    weight: "",
    height: "",
    age: "22",
    gender: "female",
    restrictions: [] as string[],
  });

  // --- VALIDATION HELPER ---
  const validateForm = (currentStep: number): boolean => {
    setErrorMessage(null);
    if (currentStep === 2) {
      const w = parseFloat(profile.weight);
      const h = parseFloat(profile.height);
      const a = parseInt(profile.age, 10);
      if (isNaN(w) || w < 30 || w > 300) { setErrorMessage("Please enter a valid weight (30-300 kg)."); return false; }
      if (isNaN(h) || h < 100 || h > 250) { setErrorMessage("Please enter a valid height (100-250 cm)."); return false; }
      if (isNaN(a) || a < 13 || a > 100) { setErrorMessage("Please enter a valid age (13-100 years)."); return false; }
    }
    return true;
  };

  useEffect(() => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        setErrorMessage("Authentication session missing. Redirecting to login...");
        setTimeout(() => { navigate({ to: "/login" }); }, 1500);
        return;
      }
      setAuthToken(token);
      const storedSession = localStorage.getItem("user_profile");
      if (storedSession) {
        const parsed: StoredUserSession = JSON.parse(storedSession);
        setCurrentUserId(parsed.userId);
        if (parsed.username) {
          setProfile((prev) => ({ ...prev, fullName: parsed.username }));
        }
      }
    } catch (e) {
      console.error("Failed to read user data parameters out of local cache session:", e);
    }
  }, [navigate]);

  const nextStep = () => {
    if (validateForm(step)) setStep((s) => (s + 1) as Step);
  };
  
  const prevStep = () => {
    setErrorMessage(null);
    setStep((s) => (s - 1) as Step);
  };

  const handleFinish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm(2)) return; // Ensure metrics are valid on final step
    
    const targetUserId = currentUserId || 3; 
    setIsSubmitting(true);
    setErrorMessage(null);

    const goalMapping: Record<string, string> = {
      lose: "lose_weight",
      maintain: "maintain",
      gain: "gain_weight",
    };

    const activityMapping: Record<string, number> = {
      sedentary: 0,
      moderate: 1,
      active: 2,
    };

    const payload = {
      fullName: profile.fullName || "User",
      weight: parseFloat(profile.weight) || 0,
      height: parseFloat(profile.height) || 0,
      age: parseInt(profile.age, 10) || 22,
      gender: profile.gender,
      healthGoal: goalMapping[profile.goal] || "maintain_weight",
      activityLevel: activityMapping[profile.activity] ?? 1,
      allergies: profile.restrictions.join(", "),
      dislikes: "",
      dietaryPreferences: profile.restrictions.includes("vegan") || profile.restrictions.includes("vegetarian") 
        ? profile.restrictions.filter(r => ["vegan", "vegetarian", "keto"].includes(r)).join(", ")
        : "",
    };

    try {
      const response = await fetch(`https://nutiplanner-api-2.onrender.com/user/${targetUserId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Your login session expired or is invalid. Please log in again.");
        }
        throw new Error(`Server returned error status code: ${response.status}`);
      }

      const jsonResponse = await response.json();
      if (jsonResponse?.data) {
        localStorage.setItem("user_profile", JSON.stringify({
          userId: jsonResponse.data.userId,
          username: jsonResponse.data.username,
          email: jsonResponse.data.email,
          role: jsonResponse.data.role,
          createdAt: jsonResponse.data.createdAt,
          userInfo: jsonResponse.data.userInfo
        }));
      }

      navigate({ to: "/dashboard" });
    } catch (error: any) {
      console.error("Critical onboarding form propagation exception caught:", error);
      setErrorMessage(error?.message || "Communication pipeline to Render infrastructure timed out or broke.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <span className="font-display text-lg font-bold">NutriSmart</span>
            <span className="text-xs font-semibold text-muted-foreground/60 uppercase">Engine Configuration</span>
          </div>
          <div className="text-xs font-semibold text-muted-foreground">
            Step {step} of 3
          </div>
        </div>

        {errorMessage && (
          <div className="mb-4 rounded-2xl bg-destructive/10 p-4 text-sm font-medium text-destructive animate-in fade-in slide-in-from-top-2">
            {errorMessage}
          </div>
        )}

        <div className="rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-soft)] sm:p-10">
          {step === 1 && (
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-citrus/20 text-primary">
                <Target className="h-5 w-5 text-citrus" />
              </div>
              <h2 className="mt-4 font-display text-2xl font-semibold sm:text-3xl">What's your primary focus?</h2>
              <p className="mt-1 text-sm text-muted-foreground">We modify macro parameters around this baseline intent.</p>

              <div className="mt-8 space-y-3">
                {[
                  { id: "lose", title: "Weight Loss / Fat Burn", desc: "Slight deficit layout targeted at lean muscle hold." },
                  { id: "maintain", title: "Maintain & Recomp", desc: "Optimizing vital health rings and metabolic strength balance." },
                  { id: "gain", title: "Hypertrophy / Mass Gain", desc: "Caloric and carb surplus targeting structural output optimization." }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setProfile({ ...profile, goal: item.id })}
                    className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between ${
                      profile.goal === item.id 
                        ? "border-leaf bg-leaf-soft/40 ring-1 ring-leaf" 
                        : "border-border bg-background hover:bg-muted/30"
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-sm">{item.title}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{item.desc}</div>
                    </div>
                    {profile.goal === item.id && <div className="h-5 w-5 rounded-full bg-leaf flex items-center justify-center text-primary"><Check className="h-3 w-3" /></div>}
                  </button>
                ))}
              </div>

              <div className="mt-8 flex justify-end">
                <button type="button" onClick={nextStep} className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90">
                  Continue
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-lavender/20 text-primary">
                <Scale className="h-5 w-5 text-lavender" />
              </div>
              <h2 className="mt-4 font-display text-2xl font-semibold sm:text-3xl">Metrics & Physical Activity</h2>
              <p className="mt-1 text-sm text-muted-foreground">Used to accurately deduce your TDEE and daily water matrix.</p>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Weight (kg)</label>
                  <input
                    type="number"
                    placeholder="50"
                    value={profile.weight}
                    onChange={(e) => setProfile({ ...profile, weight: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-leaf focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Height (cm)</label>
                  <input
                    type="number"
                    placeholder="155"
                    value={profile.height}
                    onChange={(e) => setProfile({ ...profile, height: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-leaf focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Age (years)</label>
                  <input
                    type="number"
                    placeholder="22"
                    value={profile.age}
                    onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-leaf focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Gender</label>
                  <select
                    value={profile.gender}
                    onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-leaf focus:outline-none h-[46px]"
                  >
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                  </select>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Weekly Activity Level</label>
                <div className="space-y-3">
                  {[
                    { id: "sedentary", label: "Sedentary", desc: "Desk job, minor structural workout routines." },
                    { id: "moderate", label: "Active Trainer", desc: "3-5 specialized training loads / runs a week." },
                    { id: "active", label: "Elite Output", desc: "Daily heavy exertion or athletic performance tracks." }
                  ].map((act) => (
                    <button
                      key={act.id}
                      type="button"
                      onClick={() => setProfile({ ...profile, activity: act.id })}
                      className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between ${
                        profile.activity === act.id 
                          ? "border-leaf bg-leaf-soft/40 ring-1 ring-leaf" 
                          : "border-border bg-background hover:bg-muted/30"
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-sm">{act.label}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{act.desc}</div>
                      </div>
                      {profile.activity === act.id && <div className="h-5 w-5 rounded-full bg-leaf flex items-center justify-center text-primary"><Check className="h-3 w-3" /></div>}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-8 flex justify-between">
                <button type="button" onClick={prevStep} className="rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-medium hover:bg-muted">Back</button>
                <button type="button" onClick={nextStep} className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90">Continue</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col items-center justify-center text-center py-10">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-leaf-soft text-primary">
                <Dumbbell className="h-6 w-6 text-leaf" />
              </div>
              <h2 className="mt-6 font-display text-2xl font-semibold sm:text-3xl">
                Ready to build your dashboard
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Your profile setup is complete. Click below to generate your personalized plan.
              </p>
              <div className="mt-8">
                <button
                  type="button"
                  disabled={isSubmitting || !authToken}
                  onClick={handleFinish}
                  className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isSubmitting ? "Building..." : "Build My Dashboard"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}