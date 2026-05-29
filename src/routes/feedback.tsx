import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Star, MessageSquare, Loader2, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Card } from "@/components/ui-bits";

const API_FEEDBACK_URL = "https://nutiplanner-api-2.onrender.com/feedback";

// --- AUTHENTICATION HOOK BRIDGE ---
function useAuth() {
  const token = localStorage.getItem("auth_token");
  const userProfileStr = localStorage.getItem("user_profile");
  
  let userId: string | null = null;
  if (userProfileStr) {
    try {
      const user = JSON.parse(userProfileStr);
      userId = user.userId || user.id || null;
    } catch (e) {
      console.error("Failed to parse user_profile payload", e);
    }
  }

  const isAuthenticated = !!token && !!userId;
  return { token, isAuthenticated };
}

export const Route = createFileRoute("/feedback")({
  head: () => ({
    meta: [
      { title: "Submit Feedback — NutriSmart" },
      { name: "description", content: "Share your experience with our AI meal optimization engine." },
    ],
  }),
  component: FeedbackPage,
});

function FeedbackPage() {
  const { token, isAuthenticated } = useAuth();
  
  // --- FORM STATE ---
  const [rating, setRating] = useState<number>(5);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [comment, setComment] = useState<string>("");
  
  // --- ASYNC STATES ---
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // --- SUBMIT HANDLER ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setErrorMessage("Your authorization session is invalid. Please log in again.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(API_FEEDBACK_URL, {
        method: "POST",
        headers: {
          "Accept": "*/*",
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          rating: Number(rating),
          comment: comment.trim()
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.message || "Could not process your feedback record.");
      }

      setSuccessMessage("Thank you! Your feedback has been received and logged.");
      setComment("");
      setRating(5);
    } catch (err: any) {
      setErrorMessage(err.message || "A network routing error occurred while processing submission flags.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- UNAUTHENTICATED GUARD STATE ---
  if (!isAuthenticated) {
    return (
      <AppShell>
        <div className="flex flex-col h-[50vh] w-full items-center justify-center p-6 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h3 className="font-display text-lg font-semibold">Authentication Guard Active</h3>
          <p className="text-sm text-muted-foreground max-w-sm mt-1 mb-6">
            Please log in to your account to securely transmit app diagnostic feedback.
          </p>
          <Link to="/login" className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-sm hover:opacity-90 transition-opacity">
            Go to Login
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-6 p-6">
        <PageHeader
          eyebrow="Application Engine Experience"
          title="Share Your Feedback"
          description="Help us optimize your nutrition models, platform workflows, and responsive parameters."
        />

        {/* NOTIFICATION LAYER */}
        {errorMessage && (
          <div className="flex items-start gap-3 rounded-xl bg-berry/10 p-4 text-xs font-medium text-berry border border-berry/20 animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="flex items-start gap-3 rounded-xl bg-leaf-soft p-4 text-xs font-semibold text-primary border border-leaf/20 animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-leaf" />
            <span>{successMessage}</span>
          </div>
        )}

        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* RATING SELECTION PANEL (1-5 STARS) */}
            <div className="block">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-2">
                Experience Rating
              </span>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((starValue) => {
                  const isFilled = hoveredRating !== null ? starValue <= hoveredRating : starValue <= rating;
                  return (
                    <button
                      key={starValue}
                      type="button"
                      disabled={isLoading}
                      onClick={() => setRating(starValue)}
                      onMouseEnter={() => setHoveredRating(starValue)}
                      onMouseLeave={() => setHoveredRating(null)}
                      className="p-1 rounded-md text-muted-foreground/30 hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-ring/20"
                    >
                      <Star
                        className={`h-7 w-7 transition-colors stroke-[2] ${
                          isFilled ? "fill-citrus text-citrus" : "text-muted-foreground/30"
                        }`}
                      />
                    </button>
                  );
                })}
                <span className="text-xs font-bold text-muted-foreground ml-3">
                  ({rating} out of 5)
                </span>
              </div>
            </div>

            {/* TEXT COMMENTS FIELD */}
            <label className="block w-full">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <MessageSquare className="h-3 w-3" /> Detailed Commentary
              </span>
              <textarea
                required
                rows={5}
                disabled={isLoading}
                placeholder="Good suggestions! Provide notes on diet layouts, response parameters, or anomalies here..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-border bg-muted/40 p-3.5 text-sm placeholder:text-muted-foreground/40 focus:bg-background focus:outline-none focus:ring-2 focus:ring-ring/40 transition-all font-medium resize-none min-h-[120px]"
              />
            </label>

            {/* SUBMISSION BUTTON ACTIONS */}
            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-1.5 rounded-xl border border-border px-4 py-2.5 text-xs font-semibold hover:bg-muted transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Return to Safety
              </Link>
              <button
                type="submit"
                disabled={isLoading || !comment.trim()}
                className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity shadow-sm"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Processing ...
                  </>
                ) : (
                  "Transmit Feedback"
                )}
              </button>
            </div>

          </form>
        </Card>
      </div>
    </AppShell>
  );
}