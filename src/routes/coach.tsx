import { useState, useRef, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Sparkles, Send, Lightbulb, Salad, Dumbbell, Droplets, X, Settings } from "lucide-react";
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

const initialMessages = [
  { from: "coach", text: "Morning, Maya. I noticed your protein dipped Wednesday. Want me to add a 20g snack to today's plan?" },
  { from: "user", text: "Yes please — keep it under 200 kcal." },
  { from: "coach", text: "Done. I added a Greek yogurt + almond cup at 3:30 PM (180 kcal, 22g protein). Closes your ring nicely." },
];

const prompts = [
  { icon: Salad, t: "Suggest a low-carb dinner using salmon" },
  { icon: Dumbbell, t: "Build a high-protein day for leg day" },
  { icon: Droplets, t: "Why am I always thirsty in the afternoon?" },
];

// Simple dictionary mapping keywords to contextual mock coach responses
const aiResponses: Record<string, string> = {
  salmon: "For a lean, low-carb setup, try pan-searing 150g of Wild Salmon fillet in 1 tsp olive oil. Pair it with air-fried asparagus and a side of mashed cauliflower with garlic. Total macros: ~340 kcal, 35g protein, 6g net carbs.",
  leg: "On high-volume training days, we want to maximize glycogen replenishment! Let's hit 2,100 kcal today. Aim for an overnight oat bowl for breakfast (protein powder + banana), a massive tofu/chicken bowl for lunch, and a sweet potato mash base at dinner.",
  thirsty: "Afternoon dehydration is common if your mineral balance dips post-workout. Since you hit a strength session early, make sure you're taking in electrolytes (magnesium/sodium) with your 2PM hydration window, rather than just plain water.",
  default: "That's an excellent angle to focus on! To tailor that precisely to your current profile, should we adjust your primary daily targets, or design a specific meal structure for tomorrow's logging sequence?"
};

function CoachPage() {
  // --- STATE MANAGEMENT ---
  const [messages, setMessages] = useState(initialMessages);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [preferences, setPreferences] = useState([
    "Vegetarian, no shellfish",
    "Goal: 128g protein / day",
    "Trains 4x weekly (strength)",
    "Avoids ultra-processed foods"
  ]);
  
  // UI Controls
  const [isPrefModalOpen, setIsPrefModalOpen] = useState(false);
  const [newPrefInput, setNewPrefInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // --- AUTOMATIC SCROLL TO BOTTOM ---
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // --- CORE SYSTEM CHAT ACTION CORE LOGIC ---
  const handleSendMessage = (textToSend: string) => {
    if (!textToSend.trim()) return;

    // 1. Append User Message
    const updatedMessages = [...messages, { from: "user", text: textToSend }];
    setMessages(updatedMessages);
    setInputValue("");
    setIsTyping(true);

    // 2. Determine Simulated Context Response based on text keywords
    const cleanText = textToSend.toLowerCase();
    let responseText = aiResponses.default;
    
    if (cleanText.includes("salmon") || cleanText.includes("carb")) responseText = aiResponses.salmon;
    else if (cleanText.includes("leg") || cleanText.includes("protein")) responseText = aiResponses.leg;
    else if (cleanText.includes("thirsty") || cleanText.includes("water")) responseText = aiResponses.thirsty;

    // 3. Trigger Mock Engine Stream Delay
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [...prev, { from: "coach", text: responseText }]);
    }, 1200);
  };

  // --- PREFERENCE PANEL UPDATER ---
  const handleAddPreference = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrefInput.trim()) return;
    setPreferences((prev) => [...prev, newPrefInput.trim()]);
    setNewPrefInput("");
  };

  const handleRemovePreference = (index: number) => {
    setPreferences((prev) => prev.filter((_, idx) => idx !== index));
  };

  return (
    <AppShell>
      <div className="space-y-6 p-6 relative">
        <PageHeader
          eyebrow="Always learning"
          title="AI coach"
          description="Ask anything about meals, macros or training. I remember your preferences and goals."
        />

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          
          {/* MAIN COLUMN: CONVERSATIONAL INTERFACE PLATFORM */}
          <Card className="flex h-[600px] flex-col p-0 overflow-hidden border border-border shadow-sm">
            {/* Thread Header Banner */}
            <div className="flex items-center gap-3 border-b border-border px-6 py-4 bg-card">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-sm">
                <Sparkles className="h-5 w-5 text-leaf animate-pulse" />
              </div>
              <div>
                <div className="font-display text-base font-semibold">Sage</div>
                <div className="text-xs text-leaf font-medium flex items-center gap-1.5">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-leaf animate-ping" />
                  Online · personalized for Maya
                </div>
              </div>
            </div>

            {/* Conversational Scroll View Area */}
            <div className="flex-1 space-y-4 overflow-y-auto px-6 py-6 bg-muted/10">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.from === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-200`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                      m.from === "user"
                        ? "rounded-br-sm bg-primary text-primary-foreground font-medium"
                        : "rounded-bl-sm bg-leaf-soft text-primary border border-leaf/10"
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}

              {/* Animated Core Processing Status Flag Node */}
              {isTyping && (
                <div className="flex justify-start animate-in fade-in duration-100">
                  <div className="rounded-2xl rounded-bl-sm bg-muted border border-border/40 px-4 py-3">
                    <div className="flex gap-1.5 items-center h-4">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Action Form Tray */}
            <div className="border-t border-border p-4 bg-card">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSendMessage(inputValue); }}
                className="flex items-center gap-2 rounded-2xl border border-border bg-muted/40 px-4 py-1.5 focus-within:bg-background focus-within:ring-2 focus-within:ring-ring/40 transition-all"
              >
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask Sage anything about macros, meals, or targets…"
                  className="flex-1 bg-transparent py-2.5 text-sm focus:outline-none"
                  disabled={isTyping}
                />
                <button 
                  type="submit"
                  disabled={!inputValue.trim() || isTyping}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-40 transition-opacity"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </Card>

          {/* SIDEBAR HOVER: PROMPT PRESETS & ENGINE DIRECTORY */}
          <div className="space-y-4">
            <Card>
              <div className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-citrus" />
                <h3 className="font-display text-md font-semibold">Try asking</h3>
              </div>
              <div className="mt-4 space-y-2">
                {prompts.map((p) => {
                  const Icon = p.icon;
                  return (
                    <button
                      key={p.t}
                      onClick={() => handleSendMessage(p.t)}
                      disabled={isTyping}
                      className="flex w-full items-start gap-3 rounded-xl border border-border bg-card p-3 text-left text-xs font-medium transition-all hover:border-leaf hover:bg-leaf-soft disabled:opacity-50 group"
                    >
                      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-leaf group-hover:scale-110 transition-transform" />
                      <span>{p.t}</span>
                    </button>
                  );
                })}
              </div>
            </Card>

            {/* PREFERENCE DATA MONITOR COMPONENT OVERLAY LINK */}
            <Card className="bg-[var(--gradient-hero)] text-primary-foreground shadow-md relative overflow-hidden">
              <div className="text-xs font-bold uppercase tracking-wider text-primary-foreground/70 flex items-center justify-between">
                <span>Sage knows</span>
                <Settings className="h-3.5 w-3.5 opacity-60" />
              </div>
              <ul className="mt-3 space-y-1.5 text-xs font-medium">
                {preferences.map((pref, idx) => (
                  <li key={idx} className="truncate">• {pref}</li>
                ))}
              </ul>
              <button 
                onClick={() => setIsPrefModalOpen(true)}
                className="mt-4 text-xs font-bold text-leaf hover:underline flex items-center gap-1 focus:outline-none"
              >
                Update preferences →
              </button>
            </Card>
          </div>
        </div>

        {/* --- INTERACTIVE PREFERENCE CONTROL DRAWER --- */}
        {isPrefModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
            <Card className="w-full max-w-sm p-5 relative bg-card shadow-2xl border border-border animate-in scale-in-95">
              <button 
                onClick={() => setIsPrefModalOpen(false)}
                className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
              
              <h3 className="font-display text-base font-semibold mb-1">Update Core Preferences</h3>
              <p className="text-xs text-muted-foreground mb-4">Edit configuration guidelines that shape Sage's real-time nutrition insight responses.</p>
              
              {/* Insert Form */}
              <form onSubmit={handleAddPreference} className="flex gap-2 mb-4">
                <input
                  type="text"
                  required
                  placeholder="e.g., Lactose intolerant, Goal 2k kcal"
                  value={newPrefInput}
                  onChange={(e) => setNewPrefInput(e.target.value)}
                  className="flex-1 text-xs px-3 py-2 rounded-lg border border-border bg-muted/40 focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button 
                  type="submit" 
                  className="bg-primary text-primary-foreground px-3 text-xs rounded-lg font-semibold hover:opacity-90"
                >
                  Add
                </button>
              </form>

              {/* Dynamic Content List Render */}
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {preferences.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">No custom preferences registered.</p>
                ) : (
                  preferences.map((pref, i) => (
                    <div key={i} className="flex items-center justify-between text-xs p-2 bg-muted/60 rounded-lg border border-border/40 font-medium">
                      <span className="truncate pr-2">{pref}</span>
                      <button 
                        type="button"
                        onClick={() => handleRemovePreference(i)} 
                        className="text-muted-foreground hover:text-berry shrink-0"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              <button
                onClick={() => setIsPrefModalOpen(false)}
                className="w-full mt-4 text-xs font-semibold py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-95 text-center"
              >
                Finish Config Changes
              </button>
            </Card>
          </div>
        )}

      </div>
    </AppShell>
  );
}