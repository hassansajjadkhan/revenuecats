"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { isSupabaseConfigured, supabase } from "@/lib/supabase/client";
import {
  Github,
  Figma,
  Slack,
  Mail,
  Globe,
  Code2,
  Zap,
  Database,
  Cpu,
  Lock,
  Cloud,
  Terminal,
  Palette,
  Smartphone,
  BarChart3,
  LogIn,
  Settings,
  Bell,
  Users,
  Folder,
  Download,
  Upload,
  Search,
  Filter,
  Play,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Copy,
  Share2,
  Heart,
  Star,
  MessageCircle,
  Eye,
  Edit,
  Trash2,
  Plus,
  Minus,
  Clock,
  Calendar,
  MapPin,
  TrendingUp,
  PieChart,
  AreaChart,
  BarChart,
  LineChart,
  ShoppingCart,
  CreditCard,
  DollarSign,
  Briefcase,
  Layers,
  Box,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [nextPath, setNextPath] = useState("/dashboard");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const next = params.get("next") || "/dashboard";
    setNextPath(next);

    if (!supabase) return;

    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        router.replace(next);
      }
    });
  }, [router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!isSupabaseConfigured || !supabase) {
      setError("Supabase is not configured yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY).");
      return;
    }

    setIsSubmitting(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setIsSubmitting(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    router.replace(nextPath);
  };

  return (
    <main className="min-h-screen bg-[#0f1115] text-white grid grid-cols-1 lg:grid-cols-2">
      <section className="relative bg-[#252628] border-r border-white/10">
        <div className="absolute top-8 left-8">
          <div className="w-9 h-9 rounded-md bg-[#ed4d5f] grid place-items-center font-bold text-sm">RC</div>
        </div>

        <div className="max-w-xl mx-auto min-h-screen flex flex-col justify-center px-8 sm:px-14">
          <h1 className="text-5xl font-semibold tracking-tight mb-3">Log in</h1>
          <p className="text-white/75 mb-10 text-lg">
            Welcome back! Please enter your email and password to continue.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm text-white/85 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                required
                className="w-full h-12 px-4 rounded-xl border border-white/20 bg-[#2a2c31] outline-none focus:border-[#6c82ff]"
              />
            </div>

            <div>
              <label className="block text-sm text-white/85 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="password"
                required
                className="w-full h-12 px-4 rounded-xl border border-white/20 bg-[#2a2c31] outline-none focus:border-[#6c82ff]"
              />
            </div>

            {error && (
              <p className="text-sm text-red-300">{error}</p>
            )}

            <div className="flex items-center justify-end gap-4 pt-1">
              <Link href="/signup" className="text-[#8ea2ff] hover:text-[#b0bbff] text-lg">
                Sign up
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="h-12 px-6 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 transition-colors disabled:opacity-60"
              >
                {isSubmitting ? "Logging in..." : "Log in"}
              </button>
            </div>
          </form>

          <div className="mt-16 text-sm text-white/65 flex flex-wrap gap-x-4 gap-y-2">
            <span>Terms and conditions</span>
            <span>Privacy policy</span>
            <span>RevenueCat Status</span>
            <span>Manage cookies</span>
          </div>
        </div>
      </section>

      <section className="hidden lg:flex items-center justify-center bg-[#141b2a] px-12">
        <div className="grid grid-cols-6 gap-3 max-w-2xl">
          {[
            { Icon: Github, bg: "bg-black", icon: "text-white" },
            { Icon: Figma, bg: "bg-[#a259ff]", icon: "text-white" },
            { Icon: Slack, bg: "bg-[#e01e5a]", icon: "text-white" },
            { Icon: Globe, bg: "bg-[#0066cc]", icon: "text-white" },
            { Icon: Zap, bg: "bg-[#ffd700]", icon: "text-black" },
            { Icon: Database, bg: "bg-[#336791]", icon: "text-white" },
            { Icon: Code2, bg: "bg-[#f97316]", icon: "text-white" },
            { Icon: Cpu, bg: "bg-[#1e1e1e]", icon: "text-[#00ff00]" },
            { Icon: Cloud, bg: "bg-[#1f2937]", icon: "text-white" },
            { Icon: Terminal, bg: "bg-black", icon: "text-[#00ff00]" },
            { Icon: Palette, bg: "bg-[#ff6b6b]", icon: "text-white" },
            { Icon: Smartphone, bg: "bg-[#4f46e5]", icon: "text-white" },
            { Icon: BarChart3, bg: "bg-[#10b981]", icon: "text-white" },
            { Icon: Bell, bg: "bg-[#f59e0b]", icon: "text-white" },
            { Icon: Users, bg: "bg-[#8b5cf6]", icon: "text-white" },
            { Icon: Lock, bg: "bg-[#ef4444]", icon: "text-white" },
            { Icon: Settings, bg: "bg-[#6366f1]", icon: "text-white" },
            { Icon: RefreshCw, bg: "bg-[#06b6d4]", icon: "text-white" },
            { Icon: Heart, bg: "bg-[#ec4899]", icon: "text-white" },
            { Icon: Star, bg: "bg-[#f59e0b]", icon: "text-white" },
            { Icon: TrendingUp, bg: "bg-[#14b8a6]", icon: "text-white" },
            { Icon: ShoppingCart, bg: "bg-[#d946ef]", icon: "text-white" },
            { Icon: CreditCard, bg: "bg-[#06b6d4]", icon: "text-white" },
            { Icon: DollarSign, bg: "bg-[#84cc16]", icon: "text-white" },
            { Icon: PieChart, bg: "bg-[#f97316]", icon: "text-white" },
            { Icon: Calendar, bg: "bg-[#0ea5e9]", icon: "text-white" },
            { Icon: Search, bg: "bg-[#6366f1]", icon: "text-white" },
            { Icon: Download, bg: "bg-[#10b981]", icon: "text-white" },
            { Icon: Upload, bg: "bg-[#8b5cf6]", icon: "text-white" },
            { Icon: CheckCircle2, bg: "bg-[#22c55e]", icon: "text-white" },
            { Icon: Mail, bg: "bg-[#ea580c]", icon: "text-white" },
            { Icon: Briefcase, bg: "bg-[#0066cc]", icon: "text-white" },
            { Icon: Layers, bg: "bg-[#ec4899]", icon: "text-white" },
            { Icon: Box, bg: "bg-[#f59e0b]", icon: "text-white" },
            { Icon: MessageCircle, bg: "bg-[#3b82f6]", icon: "text-white" },
            { Icon: LineChart, bg: "bg-[#14b8a6]", icon: "text-white" },
          ].map(({ Icon, bg, icon }, index) => (
            <div
              key={index}
              className={`w-16 h-16 rounded-2xl ${bg} flex items-center justify-center hover:scale-110 transition-transform duration-300 cursor-pointer`}
            >
              <Icon className={`w-7 h-7 ${icon}`} strokeWidth={1.5} />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
