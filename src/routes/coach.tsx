import { useState, useRef, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Sparkles, Send, User, Mail, Loader2 } from "lucide-react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Card } from "@/components/ui-bits";
import emailjs from "@emailjs/browser";
import { GoogleGenerativeAI } from "@google/generative-ai";
import ReactMarkdown from "react-markdown";
export const Route = createFileRoute("/coach")({
  component: CoachPage,
});

interface Message {
  from: "coach" | "user" | "system" | "nutritionist";
  text: string;
}

type ChatStatus = "chatting" | "suggest_handoff" | "with_nutritionist" | "ended";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || "");

export function CoachPage() {
  const [messages, setMessages] = useState<Message[]>([
    { from: "coach", text: "Morning! I'm Sage, your AI companion. Ask me anything about your meals or macro balances today!" }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [chatStatus, setChatStatus] = useState<ChatStatus>("chatting");
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendConversationToEmail = async (nutritionistQuestion: string, currentHistory: Message[]) => {
    setIsSendingEmail(true);
    try {
      const transcript = currentHistory
        .map((m) => `${m.from.toUpperCase()}: ${m.text}`)
        .join("\n");

      const templateParams = {
        user_name: "hanan",
        user_new_question: nutritionistQuestion,
        chat_transcript: transcript,
      };

      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        templateParams,
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      );
    } catch (error) {
      console.error("Email setup error:", error);
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isTyping) return;

    // Handoff Logic
    if (chatStatus === "with_nutritionist") {
      const updatedHistory: Message[] = [...messages, { from: "user", text: textToSend }];
      setMessages(updatedHistory);
      setInputValue("");
      sendConversationToEmail(textToSend, updatedHistory);

      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { from: "nutritionist", text: "Your message has been routed to Hanan. You will receive an assessment directly back at your account's email address." }
        ]);
      }, 1000);
      return;
    }

    // AI Logic
    const updatedMessages: Message[] = [...messages, { from: "user", text: textToSend }];
    setMessages(updatedMessages);
    setInputValue("");
    setIsTyping(true);
const lower = textToSend.toLowerCase();

if (
  lower.includes("nutritionist") ||
  lower.includes("expert") ||
  lower.includes("human nutritionist") ||
  lower.includes("contact") ||
  lower.includes("email")
) {
  setMessages((prev) => [
    ...prev,
    {
      from: "coach",
      text: `You can contact our nutrition specialist at **hanahailekiros27@gmail.com**.

You may also click **"Talk to Nutritionist"** to send your question directly through the app.`
    }
  ]);

  setIsTyping(false);
  return;
}
    try {
      const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash"
});
      const result = await model.generateContent({
        contents: updatedMessages
          .filter((m) => m.from === "user" || m.from === "coach")
          .map((m) => ({ role: m.from === "user" ? "user" : "model", parts: [{ text: m.text }] }))
      });

      const responseText = result.response.text();

      if (responseText.includes("[ESC]")) {
        const cleanText = responseText.replace("[ESC]", "").trim();
        setMessages((prev) => [...prev, { from: "coach", text: cleanText }]);
        setChatStatus("suggest_handoff");
      } else {
        setMessages((prev) => [...prev, { from: "coach", text: responseText }]);
      }
    } catch (error: any) {
      console.error("API Error details:", error);

      let errorMessage = "I'm sorry, I'm having trouble connecting to my brain right now.";

      // Specific check for 503 Service Unavailable
      const errorString = error.toString();
      if (errorString.includes("503")) {
        errorMessage = "The AI service is temporarily overloaded. Please wait a few seconds and try sending your message again.";
      } else if (errorString.includes("429")) {
        errorMessage = "I'm being asked too many questions at once! Let's slow down for a second.";
      } else if (errorString.includes("Failed to fetch") || !navigator.onLine) {
        errorMessage = "It looks like you're offline. Please check your internet connection.";
      }

      setMessages((prev) => [
        ...prev,
        { from: "coach", text: errorMessage }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleAcceptHandoff = () => {
    setChatStatus("with_nutritionist");
    setMessages((prev) => [
      ...prev,
      { from: "system", text: "🔒 AI Session closed. Channel routed to: hananfatih012@gmail.com. Type your specific query for the expert below." }
    ]);
  };
  const handleReturnToAI = () => {
    setChatStatus("chatting");
    setMessages((prev) => [
      ...prev,
      { from: "system", text: "🔒 Human specialist channel closed. Reconnecting to Sage AI..." },
      { from: "coach", text: "I'm back! How else can I help you with your nutrition goals today?" }
    ]);
  };
  const handleStopConversation = () => {
    setChatStatus("ended");
    setMessages((prev) => [
      ...prev,
      { from: "coach", text: "Thank you for using NutriSmart. I have closed this active tracking thread. Have a healthy day!" }
    ]);
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6 p-6">
        <PageHeader eyebrow="Fully Dynamic AI Enabled" title="AI Nutritionist Portal" description="Intelligent triage system routing automated assistance into human care structures smoothly." />
        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
          <Card className="flex h-[550px] flex-col p-0 overflow-hidden border border-border">
            <div className={`flex items-center justify-between border-b px-6 py-4 transition-colors ${chatStatus === "with_nutritionist" ? "bg-amber-50/40 border-amber-100" : "bg-card"}`}>
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-white ${chatStatus === "with_nutritionist" ? "bg-amber-500" : "bg-primary"}`}>
                  {chatStatus === "with_nutritionist" ? <User className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
                </div>
                <div>
                  <div className="text-sm font-bold">{chatStatus === "with_nutritionist" ? "Human Specialist Channel" : "Sage AI Agent"}</div>
                  <div className="text-[11px] font-medium opacity-70">{chatStatus === "with_nutritionist" ? "Forwarding to hananfatih012@gmail.com" : "Online Engine"}</div>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-muted/10">
              {messages.map((m, idx) => {
                if (m.from === "system") return (<div key={idx} className="text-center py-2 text-[11px] font-semibold text-muted-foreground bg-muted/60 rounded-lg max-w-md mx-auto border">{m.text}</div>);
                const isUser = m.from === "user";
                const isNutritionist = m.from === "nutritionist";
                return (
                  <div key={idx} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs font-medium leading-relaxed shadow-sm ${isUser ? "bg-primary text-primary-foreground rounded-br-none" : isNutritionist ? "bg-amber-100 text-amber-900 rounded-bl-none border border-amber-200" : "bg-leaf-soft text-primary rounded-bl-none"}`}>
                      <ReactMarkdown>{m.text}</ReactMarkdown>
                    </div>
                  </div>
                );
              })}
              {isTyping && (<div className="flex justify-start"><span className="text-xs text-muted-foreground animate-pulse font-medium">Sage is generating thoughts...</span></div>)}
              {isSendingEmail && (<div className="flex justify-end items-center gap-1.5 text-[10px] text-muted-foreground animate-pulse font-semibold"><Loader2 className="h-3 w-3 animate-spin text-amber-500" /> Dispatching copy to Specialist...</div>)}
              <div ref={chatEndRef} />
            </div>

            <div className="border-t p-4 bg-card">
              {isTyping && <p className="text-[10px] text-amber-600 mb-2 font-semibold">Sage is busy processing, please wait...</p>}
              {chatStatus === "suggest_handoff" ? (
                <div className="flex flex-col items-center gap-3 p-2 bg-amber-50/50 rounded-xl border border-amber-200/60">
                  <p className="text-xs font-bold text-amber-900 text-center flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-amber-600" /> Would you like to scale this inquiry up to our human expert team?</p>
                  <div className="flex gap-2 w-full max-w-xs">
                    <button onClick={handleStopConversation} className="flex-1 py-2 text-xs font-bold bg-muted border rounded-xl hover:bg-muted/80">Stop Session</button>
                    <button onClick={handleAcceptHandoff} className="flex-1 py-2 text-xs font-bold bg-amber-500 text-white rounded-xl hover:bg-amber-600 shadow-sm">Talk to Nutritionist</button>
                  </div>
                </div>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(inputValue); }} className={`flex items-center gap-2 rounded-xl border bg-muted/20 px-3 py-1 ${isTyping ? "opacity-50 pointer-events-none" : ""}`}>
                  <input type="text" disabled={chatStatus === "ended" || isTyping} value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder={chatStatus === "with_nutritionist" ? "Compose message for human specialist..." : "Ask your AI companion anything..."} className="flex-1 bg-transparent py-2 text-xs focus:outline-none" />
                  <button type="submit" disabled={!inputValue.trim() || chatStatus === "ended" || isTyping} className="p-2 bg-primary text-primary-foreground rounded-lg"><Send className="h-3 w-3" /></button>
                </form>
              )}
            </div>
          </Card>
          <div className="space-y-4">
            <Card className="text-center p-4 space-y-4">
              <h4 className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Channel Status</h4>

              <div className="inline-flex mx-auto items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold capitalize bg-muted border">
                <span className={`h-2 w-2 rounded-full ${chatStatus === "chatting" ? "bg-leaf animate-pulse" : chatStatus === "with_nutritionist" ? "bg-amber-500" : "bg-destructive"}`} />
                {chatStatus.replace("_", " ")}
              </div>

              <div className="pt-2 space-y-2">
                {chatStatus === "chatting" && (
                  <button
                    onClick={handleAcceptHandoff}
                    className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-bold rounded-lg shadow-sm transition-all transform active:scale-95"
                  >
                    Request Human Expert
                  </button>
                )}

                {chatStatus === "with_nutritionist" && (
                  <button
                    onClick={handleReturnToAI}
                    className="w-full py-2.5 px-4 bg-primary hover:bg-primary/90 text-primary-foreground text-[11px] font-bold rounded-lg shadow-sm transition-all transform active:scale-95"
                  >
                    Return to AI Assistant
                  </button>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}