"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const responses: Record<string, string> = {
  "what is peerverse":
    "Peerverse is a platform for peer-led micro-learning sessions. You can learn, teach, and earn SkillPoints!",
  "how do i earn skillpoints":
    "You earn SkillPoints by attending sessions, completing challenges, and engaging with the community.",
  "how do i become a mentor":
    "To become a mentor, host your first session under 'Share a Session' — once approved, you’ll start earning Mentor Points.",
  "can i watch sessions later":
    "Yes! You can revisit completed sessions from your Dashboard recordings section.",
  "what are badges":
    "Badges are rewards you earn for achievements like consistent learning, sharing sessions, or community contributions.",
  "who created peerverse":
    "Peerverse was created by a team passionate about collaborative learning and knowledge sharing.",
  "how does wishlist work":
    "Click the heart icon to add sessions to your wishlist. You can view them anytime from the wishlist button in the navbar.",
};

function normalize(text: string) {
  return text.toLowerCase().trim();
}

function getAnswer(input: string): string {
  const n = normalize(input);
  // Helpers
  const hasAny = (arr: string[]) => arr.some((k) => n.includes(k));
  const getRole = () => {
    try {
      if (typeof window === "undefined") return null;
      const r = localStorage.getItem("role");
      return r ? r.toLowerCase() : null;
    } catch {
      return null;
    }
  };
  const role = getRole();

  // Greetings
  if (/\b(hi|hello|hey)\b/.test(n)) {
    return "👋 Hey there! I’m the Peerverse Assistant — your learning companion. Ask me about sessions, SkillPoints, badges, or hosting!";
  }

  // Intents
  const videoWords = ["video", "videos", "session", "sessions", "class", "workshop"];
  const recommendWords = ["recommend", "suggest", "find", "see", "view", "watch", "available", "learn", "study", "show"];

  if (n.includes("python") && hasAny(videoWords)) {
    return "You can find Python sessions like *Python_Basics* under Sessions. Great pick to get started! 🐍";
  }

  if (hasAny(recommendWords) && hasAny(videoWords)) {
    return "Explore sessions under the Sessions tab — e.g., *Python_Basics*, *React Workshop*, *Machine Learning Fundamentals*. For quick learning, try Microsessions (≤60 mins). 🎥";
  }

  if (hasAny(["badge", "badges"])) {
    const tail = role === "mentor" ? "As a mentor, hosting sessions helps you earn badges!" : role === "learner" ? "As a learner, attending sessions grows your badge collection!" : "";
    return `You can earn badges like Skill Explorer, Consistent Learner, First Share, and Top Performer. Check the Badges & Rewards page. ${tail}`.trim();
  }

  if (hasAny(["skillpoints", "skill points", "points"])) {
    return "Earn SkillPoints by attending sessions, hosting, completing microsessions, and giving feedback. They track progress and unlock badges. 🚀";
  }

  if (hasAny(["mentor", "teach", "host"])) {
    return "Awesome! Go to Dashboard → Share a Session, add your topic and tags. Once approved, you’ll earn SkillPoints for teaching!";
  }

  if (hasAny(["learn", "session", "sessions", "explore"])) {
    return "You can explore all sessions on the Sessions page. For short ones, check Microsessions (≤60 mins). Keep learning!";
  }

  // About Peerverse
  if (hasAny(["peerverse", "about"]) || n.startsWith("what is") || n.startsWith("tell me")) {
    return "Peerverse is a peer-led learning platform to learn, teach, and earn SkillPoints. Explore sessions, host your own, and grow with community support. 🌱";
  }

  // Microsessions specifics
  if (hasAny(["micro", "short", "small", "quick"])) {
    return "Microsessions are short peer-led sessions (≤60 mins). Find them via the Microsessions section — perfect for quick learning boosts! ⚡";
  }

  // Attendance / progress
  if (hasAny(["attend", "progress", "complete", "finish"])) {
    return "Track your journey in Dashboard — see completed sessions, badges, and total SkillPoints. 📊";
  }

  // Feedback / community
  if (hasAny(["feedback", "help", "review", "community"])) {
    return "Give feedback after sessions or help peers in discussions. Consistent participation earns the Community Helper badge! 🤝";
  }

  // Technical / troubleshooting
  if (hasAny(["error", "not working", "can't", "cant", "issue", "problem", "404"])) {
    return "Try refreshing or re-login. If it continues, check your connection or report it via the Feedback form. 🧰";
  }

  // Navigation / pages
  if (hasAny(["home", "dashboard", "explore", "gamification", "wishlist", "microsessions"])) {
    return "Use the top Navbar to go to Home, Sessions, Dashboard, or Badges & Rewards anytime. You’ve got this!";
  }

  // Wishlist
  if (hasAny(["wishlist", "favorite", "saved"])) {
    return "Click the ❤️ next to a session to save it. View all saved items via the Wishlist heart in the Navbar.";
  }

  // Exact Q&A fallback
  if (responses[n]) return responses[n];

  return "I’m here to help with Peerverse topics — try asking about sessions, badges, or SkillPoints. 😊";
}

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "bot"; text: string }[]>([
    { role: "bot", text: "Hi! I’m the Peerverse Assistant. Ask me anything 👋" },
  ]);
  const [input, setInput] = useState("");
  const panelRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (!open) return;
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open]);

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
    }, 800);
  };

  return (
    <div className="fixed right-8 bottom-20 z-50">
      {/* Floating button */}
      <button
        aria-label="Open chatbot"
        className="h-14 w-14 rounded-full bg-[#6C63FF] text-white grid place-items-center shadow-md hover:scale-105 hover:shadow-lg hover:ring-4 hover:ring-purple-300/30 transition-transform duration-150 ease-out"
        onClick={() => setOpen((v) => !v)}
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {/* Chat window */}
      <div
        ref={panelRef}
        className={`absolute right-0 bottom-16 w-[320px] h-[400px] bg-white rounded-xl shadow-xl border overflow-hidden transform-gpu transition-all duration-200 ease-out ${
          open ? "opacity-100 scale-100" : "pointer-events-none opacity-0 scale-95"
        }`}
        style={{ transformOrigin: "bottom right" }}
      >
        <div className="h-11 px-3 flex items-center justify-between border-b bg-[#F3F0FF]">
          <div className="text-sm font-semibold">Peerverse Assistant 🤖</div>
          <button className="p-1 rounded hover:bg-white/60" onClick={() => setOpen(false)} aria-label="Close">
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        <div ref={scrollRef} className="h-[calc(400px-44px-56px)] overflow-y-auto p-3 space-y-2 bg-white">
          {messages.map((m, i) => (
            <div key={i} className={`${m.role === "user" ? "text-right" : "text-left"}`}>
              <div
                className={`$${
                  m.role === "user"
                    ? "inline-block bg-indigo-600 text-white"
                    : "inline-block bg-gray-100 text-gray-800"
                } px-3 py-2 rounded-lg text-sm max-w-[85%] break-words`}
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
            placeholder="Ask me anything..."
            className="h-9 text-sm"
          />
          <Button
            onClick={send}
            disabled={disabled}
            className="h-9 px-3 bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
