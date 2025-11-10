"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { X, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function normalize(text: string) {
  return text.toLowerCase().trim();
}

function getAnswer(input: string): string {
  const n = normalize(input);
  const hasAny = (arr: string[]) => arr.some((k) => n.includes(k));

  if (/\b(hi|hello|hey)\b/.test(n)) return "Hi mentor! How can I help with recommendations or teaching today?";
  if (hasAny(["recommend", "suggest"])) return "Tell me the learner's target skills and level; I'll propose topics, videos, and practice tasks.";
  if (hasAny(["plan", "curriculum", "outline"])) return "Start with goals → prerequisites → core topics → practice → reflection. I can draft a weekly plan if you share time available.";
  if (hasAny(["video", "videos", "resources"])) return "Prefer short, focused videos (≤15m). For deep dives, combine docs + tutorial + practice repo. I can generate a list based on skills.";
  return "I can assist with mentoring prompts, feedback rubrics, or personalized learning paths. Ask away!";
}

export type ChatMessage = { role: "user" | "bot"; text: string };

export default function ChatbotModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Persist history per mentor
  useEffect(() => {
    if (!open) return;
    try {
      const raw = localStorage.getItem("mentor_chat_history");
      if (raw) setMessages(JSON.parse(raw));
      else setMessages([{ role: "bot", text: "Hello mentor! Ask me for AI teaching assistance." }]);
    } catch {
      setMessages([{ role: "bot", text: "Hello mentor! Ask me for AI teaching assistance." }]);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    try {
      localStorage.setItem("mentor_chat_history", JSON.stringify(messages));
    } catch {}
  }, [messages, open]);

  useEffect(() => {
    if (!open) return;
    const sc = scrollRef.current;
    if (sc) sc.scrollTop = sc.scrollHeight;
  }, [messages, open]);

  const disabled = useMemo(() => !input.trim(), [input]);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    setTimeout(() => {
      const reply = getAnswer(text);
      setMessages((m) => [...m, { role: "bot", text: reply }]);
    }, 400);
  };

  return (
    <div
      className={`fixed inset-0 z-[60] ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
      style={{ transition: "opacity 150ms ease" }}
    >
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute right-6 bottom-6 w-[380px] h-[520px] bg-white rounded-xl shadow-2xl border overflow-hidden">
        <div className="h-12 px-3 flex items-center justify-between border-b bg-[#F3F0FF]">
          <div className="text-sm font-semibold">Mentor Assistant 🤖</div>
          <button className="p-1 rounded hover:bg-white/60" onClick={onClose} aria-label="Close">
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>
        <div ref={scrollRef} className="h-[calc(520px-48px-56px)] overflow-y-auto p-3 space-y-2 bg-white">
          {messages.map((m, i) => (
            <div key={i} className={`${m.role === "user" ? "text-right" : "text-left"}`}>
              <div
                className={`${m.role === "user" ? "inline-block bg-indigo-600 text-white" : "inline-block bg-gray-100 text-gray-800"} px-3 py-2 rounded-lg text-sm max-w-[85%] break-words`}
              >
                {m.text}
              </div>
            </div>
          ))}
        </div>
        <div className="h-14 border-t bg-white px-2 flex items-center gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") send();
            }}
            placeholder="Ask for AI teaching help..."
            className="h-9 text-sm"
          />
          <Button onClick={send} disabled={disabled} className="h-9 px-3 bg-indigo-600 hover:bg-indigo-700 text-white">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
