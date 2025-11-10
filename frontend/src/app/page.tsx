"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Chatbot from "@/components/Chatbot";
import AIRecommendationsBox from "@/components/AIRecommendationsBox";

const HERO_IMAGE = "https://media2.dev.to/dynamic/image/width=1000,height=420,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fi%2Fzllnbuv06vfgl9coepik.jpg";

function HeroSection() {
  const router = useRouter();
  const handleGetStarted = () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('access') : null;
      if (token) router.push('/explore');
      else router.push('/register');
    } catch {
      router.push('/register');
    }
  };
  return (
    <section className="relative isolate overflow-hidden bg-gradient-to-b from-white via-white to-[#f8f9fb]">
      <div className="absolute -top-32 -right-32 h-80 w-80 rounded-full bg-gradient-to-br from-indigo-200 to-indigo-100 blur-3xl opacity-70" />
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 lg:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-4xl lg:text-5xl font-semibold tracking-tight text-gray-900">Learn. Share. Grow with <span className="text-indigo-600">Peerverse</span>.</h1>
            <p className="mt-4 text-lg text-gray-600">Join peer-led micro-sessions, earn SkillPoints and badges, and discover your next skill through AI-powered recommendations.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button onClick={handleGetStarted} className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800">Get Started</Button>
              <Link href="/sessions"><Button className="px-6 py-3 bg-white text-gray-900 border hover:bg-gray-50">Explore Sessions</Button></Link>
            </div>
          </div>
          <div className="relative">
            <img
              src={HERO_IMAGE}
              alt="Peerverse hero illustration"
              className="mx-auto w-full aspect-[5/3] rounded-2xl shadow-lg object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function IconBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-10 w-10 rounded-md bg-indigo-50 text-indigo-700 grid place-items-center">
      {children}
    </div>
  );
}

function FeaturesSection() {
  return (
    <section className="py-14">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/sessions?max_duration=60" className="block">
            <Card className="hover:shadow-md hover:scale-[1.03] transition-transform">
              <CardContent className="p-6 cursor-pointer">
                <IconBox>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="12" rx="2"/><line x1="2" y1="20" x2="22" y2="20"/></svg>
                </IconBox>
                <h3 className="mt-4 font-semibold text-gray-900">Micro-sessions</h3>
                <p className="mt-1 text-sm text-gray-600">30–60 minute peer-led learning sessions.</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/badges" className="block">
            <Card className="hover:shadow-md hover:scale-[1.03] transition-transform">
              <CardContent className="p-6 cursor-pointer">
                <IconBox>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                </IconBox>
                <h3 className="mt-4 font-semibold text-gray-900">Gamification</h3>
                <p className="mt-1 text-sm text-gray-600">Earn SkillPoints, unlock badges, and track progress.</p>
              </CardContent>
            </Card>
          </Link>
          <AIRecommendationsBox />
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const steps = [
    { title: "Join Peerverse", desc: "Create your profile and set learning goals." },
    { title: "Learn from peers", desc: "Attend micro-sessions or watch recordings." },
    { title: "Earn SkillPoints & badges", desc: "Showcase your progress." },
  ];
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <h2 className="text-xl font-semibold text-gray-900">How it works</h2>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((s, i) => (
            <div key={i} className="relative">
              <div className="absolute hidden md:block top-5 left-full w-10 h-[2px] bg-gray-200" aria-hidden />
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 shrink-0 grid place-items-center rounded-full bg-indigo-50 text-indigo-700 font-medium">{i + 1}</div>
                <div>
                  <p className="font-medium text-gray-900">{s.title}</p>
                  <p className="text-sm text-gray-600">{s.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  const items = [
    { quote: "Peerverse helped me structure my learning with quick sessions.", name: "Asha", role: "Mentor" },
    { quote: "I discovered mentors for exactly the skills I needed.", name: "Kru", role: "Learner" },
    { quote: "Badges and points kept me motivated week after week.", name: "Samir", role: "Learner" },
  ];
  return (
    <section className="py-16 bg-[#f9fafb]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <h2 className="text-xl font-semibold text-gray-900">What learners say</h2>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map((t, i) => (
            <Card key={i} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <p className="text-gray-700">“{t.quote}”</p>
                <p className="mt-4 text-sm text-gray-500">{t.name} • {t.role}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="py-10 border-t bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center text-sm text-gray-600">
        <div className="flex items-center justify-center gap-4 mb-3">
          <a href="https://github.com" target="_blank" className="hover:text-gray-900">GitHub</a>
          <a href="https://linkedin.com" target="_blank" className="hover:text-gray-900">LinkedIn</a>
          <a href="/contact" className="hover:text-gray-900">Contact</a>
        </div>
        <p>© 2025 Peerverse. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default function Home() {
  return (
    <main className="bg-white">
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <Footer />
      <Chatbot />
    </main>
  );
}
